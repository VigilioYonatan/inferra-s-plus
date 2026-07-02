export interface OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  tier: "free" | "developer" | "enterprise";
  created_at: string;
  updated_at?: string;
}

export interface RegisterOrganizationRequestDto {
  name: string;
  slug: string;
}

export interface UpdateOrganizationRequestDto {
  name?: string;
  tier?: "free" | "developer" | "enterprise";
}

export interface MemberResponseDto {
  user_id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
}

export interface AddMemberRequestDto {
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export interface SetMemberRoleRequestDto {
  role: "owner" | "admin" | "member" | "viewer";
}

export interface InvitationResponseDto {
  id: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export interface InviteMemberRequestDto {
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
}
