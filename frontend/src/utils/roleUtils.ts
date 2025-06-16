// Role-related utilities for user interface
export const getRoleDisplayName = (roleSlug: string): string => {
  const roleNames: Record<string, string> = {
    'user': 'Người dùng',
    'fundraiser': 'Nhà gây quỹ',
    'admin': 'Quản trị viên',
    'moderator': 'Điều hành viên'
  };

  return roleNames[roleSlug] || 'Người dùng';
};

export const getRoleColor = (roleSlug: string): string => {
  const roleColors: Record<string, string> = {
    'user': 'blue',
    'fundraiser': 'green',
    'admin': 'purple',
    'moderator': 'orange'
  };

  return roleColors[roleSlug] || 'blue';
};

export const getRoleIcon = (roleSlug: string): string => {
  const roleIcons: Record<string, string> = {
    'user': '👤',
    'fundraiser': '🎯',
    'admin': '⚡',
    'moderator': '🛡️'
  };

  return roleIcons[roleSlug] || '👤';
};

export const getUserPermissions = (roleSlug: string): string[] => {
  const permissions: Record<string, string[]> = {
    'user': ['donate', 'view_campaigns', 'create_profile'],
    'fundraiser': ['donate', 'view_campaigns', 'create_profile', 'create_campaigns', 'manage_own_campaigns'],
    'admin': ['*'], // All permissions
    'moderator': ['donate', 'view_campaigns', 'create_profile', 'moderate_content', 'manage_campaigns']
  };

  return permissions[roleSlug] || permissions['user'];
};

export const canCreateCampaigns = (roleSlug: string): boolean => {
  return ['fundraiser', 'admin', 'moderator'].includes(roleSlug);
};

export const canAccessAdminPanel = (roleSlug: string): boolean => {
  return ['admin', 'moderator'].includes(roleSlug);
};

export const canModerateCampaigns = (roleSlug: string): boolean => {
  return ['admin', 'moderator'].includes(roleSlug);
};
