import axiosInstance from '@/lib/axios';
import { Activity } from '@/services/api';

export type ActivityResponse = {
  data: Activity[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
};

export type ActivityAnalytics = {
  totalActivities: number;
  completedActivities: number;
  upcomingActivities: number;
  totalParticipants: number;
  participationRate: number;
  popularCategories: { category: string; count: number }[];
};

export const getActivities = async (params: {
  page?: number;
  organizer_id?: number;
  status?: string;
  category?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  is_full?: boolean;
  almost_full?: boolean;
  upcoming?: boolean;
  past?: boolean;
  before_date?: string;
  after_date?: string;
  per_page?: number;
} = {}): Promise<ActivityResponse> => {
  try {
    const response = await axiosInstance.get('/activities', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch activities');
  }
};

export const getActivityBySlug = async (slug: string): Promise<Activity> => {
  try {
    const response = await axiosInstance.get(`/activities/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch activity');
  }
};

export const createActivity = async (activityData: FormData): Promise<Activity> => {
  try {
    const response = await axiosInstance.post('/activities', activityData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating activity:', error);
    throw new Error(error.response?.data?.message || 'Failed to create activity');
  }
};

export const updateActivity = async (slug: string, activityData: FormData): Promise<Activity> => {
  try {
    const response = await axiosInstance.post(`/activities/${slug}`, activityData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating activity:', error);
    throw new Error(error.response?.data?.message || 'Failed to update activity');
  }
};

export const deleteActivity = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/activities/${id}`);
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete activity');
  }
};

export const getActivityAnalytics = async (period: string = 'all'): Promise<ActivityAnalytics> => {
  try {
    const response = await axiosInstance.get('/activities/analytics', {
      params: { period }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching activity analytics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch activity analytics');
  }
};

export const getActivityParticipants = async (activityId: number, params: {
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<{
  data: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      avatar_url?: string;
    };
    created_at: string;
    status: 'registered' | 'attended' | 'cancelled';
  }[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}> => {
  try {
    const response = await axiosInstance.get(`/activities/${activityId}/participants`, {
      params
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching activity participants:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch activity participants');
  }
};

export const exportActivitiesReport = async (params: {
  format?: 'csv' | 'xlsx';
  start_date?: string;
  end_date?: string;
  category?: string;
  status?: string;
} = {}): Promise<Blob> => {
  try {
    const response = await axiosInstance.get('/activities/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting activities report:', error);
    throw new Error(error.response?.data?.message || 'Failed to export activities report');
  }
};
