import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { client } from '../../services';
import {
  MessageSquare,
  Heart,
  PlusCircle,
  Sparkles,
  Share2,
  Send,
  Users,
  Loader2,
} from 'lucide-react';
import type { CommunityPost } from '../../types';

export function CommunityHubPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<'ANNOUNCEMENT' | 'EVENT' | 'UPDATE' | 'POLL' | 'KNOWLEDGE'>('UPDATE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await client.getCommunityPosts();
        setPosts(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const newPost = await client.createCommunityPost({ title, body, type: postType });
      setPosts((prev) => [newPost, ...prev]);
      setTitle('');
      setBody('');
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Employee Community & Welcome Hub (FR-LIFE-08)"
        description="Connect with new hire cohorts, celebrate start milestones, and discover internal social groups across the organization."
        badge={<Badge variant="default" dot>Company-Wide Hub</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCreate(!showCreate)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            {showCreate ? 'Cancel' : 'Post Welcome Message'}
          </Button>
        }
      />

      {/* Create Post Card */}
      {showCreate && (
        <form onSubmit={handleCreatePost}>
          <Card className="p-5 bg-slate-900 border-blue-500/30 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Share a Welcome Note or Introduction
            </h3>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title or greeting..."
                className="w-full h-10 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your welcome message, introduction, or team announcement..."
                className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" isLoading={submitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
                Publish to Community
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-5 bg-slate-900/90 border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={post.authorName} size="md" status="online" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{post.authorName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {post.authorRole} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Badge variant={post.type === 'ANNOUNCEMENT' ? 'purple' : 'info'} size="sm">
                  {post.type}
                </Badge>
              </div>

              <div className="space-y-1 text-xs">
                <h3 className="text-sm font-semibold text-slate-100">{post.title}</h3>
                <p className="text-slate-300 leading-relaxed">{post.body}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
                <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>{post.likesCount} Likes</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
