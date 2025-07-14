export interface Group {
  groupId: string;
  operatorId: string;
  configuration?: Record<string, unknown>;
  tags?: Record<string, string>;
  createdAt: number;
  lastModifiedAt: number;
}

export interface ListGroupsParams {
  tag_name?: string | undefined;
  tag_value?: string | undefined;
  tag_value_match_mode?: 'exact' | 'prefix' | undefined;
  limit?: number | undefined;
  lastEvaluatedKey?: string | undefined;
}

export interface GetGroupParams {
  groupId: string;
}
