import { getApperClient } from "@/services/apperClient";
export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords('task_c', params);
      
      if (!response.success) {
        console.error("Failed to fetch tasks:", response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('task_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(`Failed to fetch task ${id}:`, response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error(`Task with Id ${id} not found`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Name: taskData.title_c || taskData.title || "Untitled Task",
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description,
          priority_c: taskData.priority_c || taskData.priority,
          status_c: taskData.status_c || taskData.status || "active"
        }]
      };

      const response = await apperClient.createRecord('task_c', params);
      
      if (!response.success) {
        console.error("Failed to create task:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          throw new Error("Failed to create task");
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include Updateable fields that have values
      const updateData = {
        Id: parseInt(id)
      };

      if (updates.title_c !== undefined || updates.title !== undefined) {
        updateData.title_c = updates.title_c || updates.title;
      }
      if (updates.description_c !== undefined || updates.description !== undefined) {
        updateData.description_c = updates.description_c || updates.description;
      }
      if (updates.priority_c !== undefined || updates.priority !== undefined) {
        updateData.priority_c = updates.priority_c || updates.priority;
      }
      if (updates.status_c !== undefined || updates.status !== undefined) {
        updateData.status_c = updates.status_c || updates.status;
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord('task_c', params);
      
      if (!response.success) {
        console.error(`Failed to update task ${id}:`, response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          throw new Error("Failed to update task");
        }
        
        return successful[0]?.data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error?.response?.data?.message || error.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('task_c', params);
      
      if (!response.success) {
        console.error(`Failed to delete task ${id}:`, response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          throw new Error("Failed to delete task");
        }
        
        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error?.response?.data?.message || error.message || error);
      throw error;
    }
}
};