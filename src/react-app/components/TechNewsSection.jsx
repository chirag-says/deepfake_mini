import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import FloatingCard from "./common/FloatingCard";
import Button from "./common/Button";

export default function TechNewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [animationSeed, setAnimationSeed] = useState(0);
  const intervalRef = useRef(null);
  const rotationRef = useRef(null);
  const VISIBLE_COUNT = 3;

  const hydrateNews = (articles) =>
    articles.map((article, index) => ({
      id: article.id || `tech-${index}`,
      title: article.title,
      description: article.description || "No description available",
      date: new Date(article.publishedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      category: "Technology",
      views: `${Math.floor(Math.random() * 20) + 1}K`,
      url: article.url,
      readTime: `${Math.max(
        1,
        Math.floor(article.content?.length / 500 || 3)
      )} min read`,
      source: article.source?.name ?? "Unknown",
      imageUrl: article.image ?? article.urlToImage,
    }));

  const fetchTechNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/news_fetch.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.articles) {
        throw new Error("Invalid response from news feed");
      }

      setNews(hydrateNews(data.articles));
      setVisibleIndex(0);
      setAnimationSeed((prev) => prev + 1);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching tech news:", err);
      setError(err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechNews();
    intervalRef.current = window.setInterval(fetchTechNews, 30000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (rotationRef.current) {
        window.clearInterval(rotationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (rotationRef.current) {
      window.clearInterval(rotationRef.current);
    }

    if (news.length > VISIBLE_COUNT) {
      rotationRef.current = window.setInterval(() => {
        setVisibleIndex((prev) => (prev + 1) % news.length);
        setAnimationSeed((prev) => prev + 1);
      }, 10000);
    } else if (news.length > 0) {
      setVisibleIndex(0);
      setAnimationSeed((prev) => prev + 1);
    }

    return () => {
      if (rotationRef.current) {
        window.clearInterval(rotationRef.current);
      }
    };
  }, [news]);

  const refreshNews = async () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    await fetchTechNews();
    intervalRef.current = window.setInterval(fetchTechNews, 30000);
  };

  const visibleNews =
    news.length <= VISIBLE_COUNT
      ? news
      : Array.from(
          { length: VISIBLE_COUNT },
          (_, offset) => news[(visibleIndex + offset) % news.length]
        );

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h3 className="text-4xl font-bold text-white mb-4">
              Live Tech News
            </h3>
            <p className="text-xl text-slate-400">
              Real-time updates from trusted technology sources
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center text-slate-400 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <span>Updates every 30s</span>
            </div>

            <div className="flex items-center text-slate-400 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshNews}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {loading && news.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <FloatingCard>
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">
                Unable to Load News
              </h4>
              <p className="text-slate-400 mb-6">{error}</p>
              <Button variant="outline" onClick={refreshNews}>
                Try Again
              </Button>
            </div>
          </FloatingCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleNews.map((item, index) => (
              <div
                key={`${animationSeed}-${item.id}-${visibleIndex + index}`}
                className="news-card-animation w-full h-full"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <FloatingCard delay={0} className="overflow-hidden h-full">
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          // eslint-disable-next-line no-param-reassign
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {item.category}
                      </span>
                      <div className="flex items-center text-slate-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.readTime}
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-3 leading-tight hover:text-blue-300 transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-slate-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {item.date}
                      </div>
                      <div className="flex items-center text-slate-500 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.views}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-sm">
                        Source: {item.source}
                      </div>

                      <Button
                        as="a"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        Read More <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </FloatingCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
