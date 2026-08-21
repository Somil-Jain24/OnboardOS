import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../services';
import {
  Search,
  Sparkles,
  FileText,
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
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-12">
      <PageHeader
        title="Company Knowledge & Policy Intelligence"
        description="Semantic RAG knowledge assistant grounding enterprise policies, architecture standards, and IT workflows with citation attribution."
        badge={<Badge variant="purple" dot>Vector Search / RAG Active</Badge>}
      />

      {/* Semantic Search Bar */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search policies, compliance rules, service wikis, or SLA standards..."
              className="w-full h-11 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <Button
            size="md"
            variant="primary"
            isLoading={isSearching}
            onClick={() => handleSearch()}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="rounded-2xl text-xs bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
          >
            Semantic Search
          </Button>
        </div>
      </div>

      {/* AI Answer & Citation Card */}
      {searchResult && (
        <div className="p-6 bg-gradient-to-r from-purple-50/70 via-white to-blue-50/70 border border-purple-200 rounded-3xl shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">AI Synthesized Policy Answer</h3>
            </div>
            <Badge variant="purple" size="sm">
              Grounded in 2 Verified Sources
            </Badge>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-sans">{searchResult.answer}</p>

          {/* Citations Grid */}
          <div className="space-y-2 pt-2 border-t border-purple-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono block">
              Direct Citations & Source Evidence:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResult.citations.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-purple-100 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      {c.docTitle}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {c.docId}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed">"{c.snippet}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indexed Knowledge Documents Repository */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
          Indexed Company Knowledge Documents ({docs.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-card space-y-2.5 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                <Badge variant="secondary" size="sm">
                  {doc.category}
                </Badge>
              </div>
              <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">{doc.content}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{doc.source}</span>
                <span>Updated: {doc.updatedAt.split('T')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

