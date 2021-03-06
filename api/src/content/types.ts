export interface IPost {
  username: string;
  name: string;
  post: string;
  url: string;
  date: number;
  tags?: string|null
}

export interface IRelation {
  post_id: number;
  tag_id: number;
}

export interface IOptions {
  tagScope: 'inclusive' | 'exclusive';
  userScope: 'all' | 'followed' | 'self';
}
