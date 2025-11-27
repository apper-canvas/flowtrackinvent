import { getApperClient } from '@/services/apperClient';

export const fileService = {
  // Get all files for a specific task
  async getByTaskId(taskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "task_c",
          "Operator": "EqualTo",
          "Values": [parseInt(taskId)],
          "Include": true
        }],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords('files_c', params);
      
      if (!response.success) {
        console.error("Failed to fetch files:", response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching files:", error?.response?.data?.message || error.message || error);
      return [];
    }
  },

  // Create files for a task
  async create(taskId, filesData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      if (!filesData || filesData.length === 0) {
        return [];
      }

      // Convert files to API format
const { ApperFileUploader } = window.ApperSDK;
      
      const records = filesData.map((file, index) => {
        // Convert individual file to create format
        const convertedFile = ApperFileUploader.toCreateFormat([file]);
        
        return {
          Name: file.Name || file.name || `File ${index + 1}`,
          task_c: parseInt(taskId),
          file_data_c: convertedFile,
          file_name_c: file.Name || file.name,
          file_size_c: Math.round((file.Size || file.size || 0) / 1024), // Convert to KB
          file_type_c: file.Type || file.type || 'application/octet-stream',
          upload_date_c: new Date().toISOString(),
          description_c: file.description || ''
        };
      });

      const params = { records };

      const response = await apperClient.createRecord('files_c', params);
      
      if (!response.success) {
        console.error("Failed to create files:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} files: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.map(r => r.data);
      }

      return response.data ? [response.data] : [];
    } catch (error) {
      console.error("Error creating files:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  // Delete a file
  async delete(fileId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: [parseInt(fileId)]
      };

      const response = await apperClient.deleteRecord('files_c', params);
      
      if (!response.success) {
        console.error("Failed to delete file:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete file: ${JSON.stringify(failed)}`);
          throw new Error("Failed to delete file");
        }
        
        return true;
      }

      return true;
    } catch (error) {
      console.error("Error deleting file:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  }
};