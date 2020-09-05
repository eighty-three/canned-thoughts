export interface IPost {
  post: string;
  url: string;
  date: number;
  tags: string;
}

export interface IRelation {
  post_id: number;
  tag_id: number;
}

export interface IOptions {
  scope: 'inclusive' | 'exclusive';
  followedOnly: boolean;
}
