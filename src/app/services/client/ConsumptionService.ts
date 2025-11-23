/**
 * ConsumptionService - Client-side service for managing consumption data
 * Handles all data operations without direct API calls from components
 */

export interface ConsumptionData {
  _id?: string;
  userId: string;
  category: string;
  value: number;
  month: number;
  year: number;
  date?: Date;
  improvementScore?: number;
  tipsGiven?: string[];
}

export interface ConsumptionRequest {
  userId: string;
  category: string;
  value: number;
  month: number;
  year: number;
}

class ConsumptionService {
  /**
   * Get consumption data for a specific user
   * @param userEmail - User email to fetch data for
   * @returns Promise<ConsumptionData[]>
   */
  async getUserConsumption(userEmail: string): Promise<ConsumptionData[]> {
    try {
      const url = `/api/consumption?userEmail=${userEmail}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        console.warn('Failed to fetch consumption data:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      return [];
    }
  }

  /**
   * Save new consumption data
   * @param consumptionData - Data to save
   * @returns Promise<boolean> - Success status
   */
  async saveConsumption(consumptionData: ConsumptionRequest): Promise<boolean> {
    try {
      const response = await fetch("/api/consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consumptionData),
      });

      return response.status === 201;
    } catch (error) {
      console.error('Error saving consumption data:', error);
      return false;
    }
  }

  /**
   * Update existing consumption data
   * @param id - Record ID to update
   * @param consumptionData - Updated data
   * @returns Promise<boolean> - Success status
   */
  async updateConsumption(id: string, consumptionData: ConsumptionRequest): Promise<boolean> {
    try {
      const response = await fetch("/api/consumption", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, ...consumptionData }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating consumption data:', error);
      return false;
    }
  }

  /**
   * Save or update consumption data (checks if exists first)
   * @param consumptionData - Data to save/update
   * @returns Promise<boolean> - Success status
   */
  async saveOrUpdateConsumption(consumptionData: ConsumptionRequest): Promise<boolean> {
    try {
      // Try to save first
      const saved = await this.saveConsumption(consumptionData);
      
      if (!saved) {
        // If save failed, try to find existing record and update
        const existingData = await this.getUserConsumption(consumptionData.userId);
        const existing = existingData.find(item => 
          item.category === consumptionData.category && 
          item.month === consumptionData.month && 
          item.year === consumptionData.year
        );

        if (existing?._id) {
          return await this.updateConsumption(existing._id, consumptionData);
        }
      }

      return saved;
    } catch (error) {
      console.error('Error in saveOrUpdateConsumption:', error);
      return false;
    }
  }

  /**
   * Get static mock data for demo purposes
   * @returns ConsumptionData[] - Mock consumption data
   */
  getStaticData(): ConsumptionData[] {
    return [
      {
        userId: "demo-user",
        category: "Electricity",
        value: 250,
        month: 10,
        year: 2024,
        improvementScore: 75,
        tipsGiven: ["Use LED bulbs", "Unplug devices when not in use"]
      },
      {
        userId: "demo-user", 
        category: "Water",
        value: 120,
        month: 10,
        year: 2024,
        improvementScore: 82,
        tipsGiven: ["Take shorter showers", "Fix leaks immediately"]
      },
      {
        userId: "demo-user",
        category: "Transportation", 
        value: 45,
        month: 10,
        year: 2024,
        improvementScore: 68,
        tipsGiven: ["Use public transport", "Share rides"]
      },
      {
        userId: "demo-user",
        category: "Waste",
        value: 15,
        month: 10,
        year: 2024,
        improvementScore: 85,
        tipsGiven: ["Recycle more", "Buy only what you need"]
      }
    ];
  }
}

// Export singleton instance
export const consumptionService = new ConsumptionService();
export default consumptionService;