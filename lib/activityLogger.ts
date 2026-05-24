interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: "profile" | "vault" | "beneficiary" | "trigger" | "settings" | "system" | "will";
  description: string;
  icon?: any;
  metadata?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export const logActivity = (
  action: string,
  category: ActivityLog["category"],
  description: string,
  metadata?: ActivityLog["metadata"]
) => {
  if (typeof window === "undefined") return;

  const activity: ActivityLog = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    description,
    metadata,
  };

  // Get existing activities
  const existingActivities = localStorage.getItem("activityLog");
  const activities: ActivityLog[] = existingActivities
    ? JSON.parse(existingActivities)
    : [];

  // Add new activity to the beginning (most recent first)
  activities.unshift(activity);

  // Keep only last 500 activities to prevent storage issues
  const trimmedActivities = activities.slice(0, 500);

  // Save back to localStorage
  localStorage.setItem("activityLog", JSON.stringify(trimmedActivities));

  // Dispatch custom event so Activity Log page can refresh
  window.dispatchEvent(new CustomEvent("activityLogged"));
};

export const getActivities = (): ActivityLog[] => {
  if (typeof window === "undefined") return [];

  const activities = localStorage.getItem("activityLog");
  return activities ? JSON.parse(activities) : [];
};

export const clearActivities = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("activityLog");
};
