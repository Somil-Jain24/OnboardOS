import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  BookOpen,
  Search,
  Sparkles,
  FileText,
  Shield,
  Layers,
  ArrowRight,
  Loader2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import type { KnowledgeDocument, KnowledgeAnswer } from '../../types';

export function KnowledgeAssistantPage() {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('cloud security policy for junior engineers');
  const [searchResult, setSearchResult] = useState<KnowledgeAnswer | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      const data = await client.getKnowledgeDocs();
      setDocs(data);
      handleSearch('cloud security policy for junior engineers');
    }
    loadDocs();
  }, []);

  const handleSearch = async (q = searchQuery) => {
    if (!q.trim()) return;
    setIsSearching(true);
    try {
      const res = await client.searchKnowledge(q);
      setSearchResult(res);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Company Knowledge & Policy Intelligence (FR-AI-02)"
        description="Semantic RAG knowledge assistant grounding enterprise policies, architecture standards, and IT workflows with citation attribution."
        badge={<Badge variant="purple" dot>Vector Search / RAG Active</Badge>}
      />

      {/* Semantic Search Bar */}
      <Card className="p-4 bg-slate-900/90 border-purple-500/30">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search policies, compliance rules, service wikis, or SLA standards..."
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <Button
            size="md"
            variant="primary"
            isLoading={isSearching}
            onClick={() => handleSearch()}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Semantic Search
          </Button>
        </div>
      </Card>

      {/* AI Answer & Citation Card */}
      {searchResult && (
        <Card className="p-5 bg-gradient-to-r from-purple-950/20 via-slate-900 to-blue-950/20 border-purple-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-100">AI Synthesized Policy Answer</h3>
            </div>
            <Badge variant="purple" size="sm">
              Grounded in 2 Verified Sources
            </Badge>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">{searchResult.answer}</p>

          {/* Citations Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
              Direct Citations & Source Evidence:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResult.citations.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {c.docTitle}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {c.docId}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] italic">"{c.snippet}"</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Indexed Knowledge Documents Repository */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Indexed Company Knowledge Documents ({docs.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <Card key={doc.id} className="p-4 bg-slate-900/80 border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 text-xs">{doc.title}</span>
                <Badge variant="info" size="sm">
                  {doc.category}
                </Badge>
              </div>
              <p className="text-slate-300 text-xs line-clamp-3">{doc.content}</p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{doc.source}</span>
                <span>Updated: {doc.updatedAt.split('T')[0]}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
