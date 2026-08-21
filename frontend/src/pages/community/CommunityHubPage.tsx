import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { client } from '../../services';
import {
  MessageSquare,
  Heart,
  PlusCircle,
  Sparkles,
  Send,
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
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-12">
      <PageHeader
        title="Employee Community & Welcome Hub"
        description="Connect with new hire cohorts, celebrate start milestones, and discover internal social groups across the organization."
        badge={<Badge variant="default" dot>Company-Wide Hub</Badge>}
        actions={
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCreate(!showCreate)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            className="rounded-xl text-xs"
          >
            {showCreate ? 'Cancel' : 'Post Welcome Message'}
          </Button>
        }
      />

      {/* Create Post Card */}
      {showCreate && (
        <form onSubmit={handleCreatePost}>
          <div className="p-6 bg-white border border-blue-200 rounded-3xl shadow-card space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Share a Welcome Note or Introduction
            </h3>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title or greeting..."
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your welcome message, introduction, or team announcement..."
                className="w-full h-24 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="secondary" onClick={() => setShowCreate(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" isLoading={submitting} leftIcon={<Send className="w-3.5 h-3.5" />} className="rounded-xl text-xs">
                Publish to Community
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-3.5 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={post.authorName} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {post.authorRole} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Badge variant={post.type === 'ANNOUNCEMENT' ? 'purple' : 'secondary'} size="sm">
                  {post.type}
                </Badge>
              </div>

              <div className="space-y-1 text-xs">
                <h3 className="text-sm font-bold text-slate-900">{post.title}</h3>
                <p className="text-slate-600 leading-relaxed text-xs">{post.body}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <button className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                  <span>{post.likesCount} Likes</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

