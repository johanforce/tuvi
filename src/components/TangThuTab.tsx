import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Tag,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Plus,
  X,
  Share2,
  Check,
  User as UserIcon,
  LogIn,
  LogOut,
  Sparkles,
  BookMarked,
  ArrowRight,
  RefreshCw,
  Edit3,
  Trash2,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { TangThuImportPanel } from './TangThuImportPanel.js';
import {
  type Article,
  ADMIN_EMAIL,
  isUserAdmin,
  getArticlesFromFirestore,
  createArticleInFirestore,
  updateArticleInFirestore,
  deleteArticleFromFirestore,
  incrementArticleViews,
  signInWithGoogle,
  signOutUser,
  subscribeAuth,
} from '../services/firebase.js';

export const TangThuTab: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication & Quyền Admin
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAdmin = useMemo(() => isUserAdmin(currentUser), [currentUser]);

  // Bộ lọc tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'readTime'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 10;

  // Đọc bài viết
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Soạn bài viết mới & Chỉnh sửa
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = subscribeAuth(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Tải danh sách bài viết từ Firebase Firestore
  const loadArticles = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getArticlesFromFirestore();
      setArticles(data);
    } catch (err) {
      console.error('Lỗi tải bài viết từ Firestore:', err);
      setError('Không thể tải bài viết từ Tàng Thư lúc này. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  // Danh mục động được trích xuất hoàn toàn từ các bài viết thực tế
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const a of articles) {
      if (a.category && a.category.trim()) cats.add(a.category.trim());
    }
    return Array.from(cats);
  }, [articles]);

  // Lọc và sắp xếp bài viết
  const filteredArticles = useMemo(() => {
    return articles
      .filter(article => {
        // Lọc chuyên mục
        if (selectedCategory !== 'Tất cả' && article.category !== selectedCategory) {
          return false;
        }
        // Tìm kiếm: tiêu đề/tóm tắt/thẻ/tác giả khớp cụm từ; nội dung khớp đủ từng từ khóa.
        if (searchQuery.trim()) {
          const q = searchQuery.toLocaleLowerCase('vi').trim();
          const terms = q.split(/\s+/).filter(Boolean);
          const content = (article.content || '').toLocaleLowerCase('vi');
          const matchTitle = article.title.toLocaleLowerCase('vi').includes(q);
          const matchSummary = article.summary?.toLocaleLowerCase('vi').includes(q);
          const matchContent = terms.length > 0 && terms.every(term => content.includes(term));
          const matchTags = article.tags?.some(t => t.toLocaleLowerCase('vi').includes(q));
          const matchAuthor = article.author?.toLocaleLowerCase('vi').includes(q);
          return matchTitle || matchSummary || matchContent || matchTags || matchAuthor;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'popular') {
          return (b.viewCount || 0) - (a.viewCount || 0);
        }
        if (sortBy === 'readTime') {
          return (a.readTime || 5) - (b.readTime || 5);
        }
        return 0;
      });
  }, [articles, selectedCategory, searchQuery, sortBy]);

  // Đổi bộ lọc/từ khóa/sắp xếp thì quay về trang đầu.
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(start, start + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage]);

  // Mở bài viết để đọc & tăng viewCount
  const handleOpenArticle = (article: Article) => {
    setActiveArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void incrementArticleViews(article.id, article.viewCount || 0);
    setArticles(prev =>
      prev.map(a => (a.id === article.id ? { ...a, viewCount: (a.viewCount || 0) + 1 } : a)),
    );
  };

  const handleShareArticle = (article: Article) => {
    const url = window.location.href;
    void navigator.clipboard.writeText(`${article.title} — ${url}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mở form tạo mới
  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSummary('');
    setFormCategory(availableCategories[0] || 'Cổ Học');
    setFormContent('');
    setFormAuthor(currentUser?.displayName || 'Biên soạn');
    setFormTags([]);
    setTagInput('');
    setPreviewMode(false);
    setShowCreateModal(true);
  };

  // Mở form chỉnh sửa bài viết (chỉ Admin)
  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormTitle(article.title);
    setFormSummary(article.summary || '');
    setFormCategory(article.category || 'Cổ Học');
    setFormContent(article.content);
    setFormAuthor(article.author || '');
    setFormTags(article.tags || []);
    setTagInput('');
    setPreviewMode(false);
    setShowCreateModal(true);
  };

  // Thêm / xóa tag trong form
  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().replace(/^#/, '');
    if (cleaned && !formTags.includes(cleaned) && formTags.length < 15) {
      setFormTags(prev => [...prev, cleaned]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // Lưu bài viết (Tạo mới hoặc Sửa)
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ tài khoản quản trị viên cthang429@gmail.com mới có quyền thêm/sửa bài viết.');
      return;
    }

    if (!formTitle.trim() || !formContent.trim() || !formCategory.trim() || formTags.length === 0) {
      alert('Vui lòng điền đầy đủ tiêu đề, chuyên mục, nội dung và ít nhất 1 thẻ (tag)!');
      return;
    }

    setIsSubmitting(true);
    try {
      const wordCount = formContent.trim().split(/\s+/).length;
      const calculatedReadTime = Math.max(1, Math.round(wordCount / 200));

      if (editingArticle) {
        // Cập nhật bài viết
        await updateArticleInFirestore(editingArticle.id, {
          title: formTitle.trim(),
          summary: formSummary.trim() || formContent.trim().slice(0, 180) + '...',
          content: formContent.trim(),
          category: formCategory.trim(),
          tags: formTags,
          author: formAuthor.trim() || 'Admin',
          readTime: calculatedReadTime,
        });

        setArticles(prev =>
          prev.map(a =>
            a.id === editingArticle.id
              ? {
                  ...a,
                  title: formTitle.trim(),
                  summary: formSummary.trim() || formContent.trim().slice(0, 180) + '...',
                  content: formContent.trim(),
                  category: formCategory.trim(),
                  tags: formTags,
                  author: formAuthor.trim() || 'Admin',
                  readTime: calculatedReadTime,
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
        );

        if (activeArticle?.id === editingArticle.id) {
          setActiveArticle(prev => prev ? {
            ...prev,
            title: formTitle.trim(),
            summary: formSummary.trim() || formContent.trim().slice(0, 180) + '...',
            content: formContent.trim(),
            category: formCategory.trim(),
            tags: formTags,
            author: formAuthor.trim() || 'Admin',
            readTime: calculatedReadTime,
            updatedAt: new Date().toISOString(),
          } : null);
        }

        showToast('Đã cập nhật bài viết thành công!');
      } else {
        // Tạo bài viết mới
        const newArticleData: Omit<Article, 'id'> = {
          title: formTitle.trim(),
          summary: formSummary.trim() || formContent.trim().slice(0, 180) + '...',
          content: formContent.trim(),
          category: formCategory.trim(),
          tags: formTags,
          author: formAuthor.trim() || 'Admin',
          authorId: currentUser?.uid,
          readTime: calculatedReadTime,
          featured: false,
          viewCount: 1,
          createdAt: new Date().toISOString(),
        };

        const newId = await createArticleInFirestore(newArticleData);
        setArticles(prev => [{ id: newId, ...newArticleData }, ...prev]);
        showToast('Đã thêm bài viết mới vào Tàng Thư thành công!');
      }

      setShowCreateModal(false);
      setEditingArticle(null);
    } catch (err) {
      console.error('Lỗi lưu bài viết vào Firestore:', err);
      alert('Không thể lưu bài viết. Vui lòng kiểm tra quyền hạn tài khoản hoặc kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa bài viết (chỉ Admin)
  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!isAdmin) {
      alert('Chỉ tài khoản quản trị viên cthang429@gmail.com mới có quyền xóa bài viết.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${articleTitle}" khỏi Tàng Thư?`)) {
      return;
    }

    try {
      await deleteArticleFromFirestore(articleId);
      setArticles(prev => prev.filter(a => a.id !== articleId));
      if (activeArticle?.id === articleId) {
        setActiveArticle(null);
      }
      showToast('Đã xóa bài viết thành công.');
    } catch (err) {
      console.error('Lỗi xóa bài viết:', err);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-900 px-4 py-3 text-sm text-emerald-100 shadow-xl transition-all">
          <Check className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isAdmin && <TangThuImportPanel onImported={() => loadArticles(true)} />}

      {/* BANNER TÀNG THƯ */}
      <section className="relative overflow-hidden rounded-2xl border border-red-900/30 bg-gradient-to-br from-red-950 via-[#3a0a10] to-[#1e0508] p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <BookMarked className="h-3.5 w-3.5" />
              <span>Kho Lưu Trữ Thư Tịch & Nghiên Cứu</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-amber-100 sm:text-3xl md:text-4xl">
              Tàng Thư Cổ Học
            </h2>
            <p className="text-sm leading-relaxed text-red-100/85 sm:text-base">
              Nơi lưu trữ các bài viết, khảo cứu chuyên sâu về Tử Vi Đẩu Số, Kinh Dịch, Nạp Âm và triết học cổ truyền.
              Dữ liệu được lưu trữ trực tuyến đồng bộ trên Firebase Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Trạng thái tài khoản người dùng */}
            {currentUser ? (
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-3 py-1.5 text-xs text-amber-100">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <UserIcon className="h-4 w-4 text-amber-300" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-white">{currentUser.displayName || currentUser.email}</span>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-300 text-[10px]">
                      <ShieldCheck className="h-3 w-3 text-amber-400" />
                      Quản trị viên ({ADMIN_EMAIL})
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">Độc giả</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  title="Đăng xuất"
                  className="ml-2 text-red-300 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/30"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập Google</span>
              </button>
            )}

            {/* NÚT SOẠN BÀI MỚI - CHỈ HIỂN THỊ KHI ĐĂNG NHẬP BẰNG GMAIL ADMIN cthang429@gmail.com */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-amber-500 hover:to-amber-600 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Soạn bài mới</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* THANH TÌM KIẾM & BỘ LỌC ĐỘNG TỪ BÀI VIẾT */}
      {articles.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết, tác giả, nội dung hoặc thẻ..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:border-red-800 focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 text-xs">
              <span className="shrink-0 text-stone-500">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-2 font-medium text-stone-700 focus:border-red-800 focus:outline-none"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Xem nhiều nhất</option>
                <option value="readTime">Thời gian đọc ngắn</option>
              </select>

              <button
                type="button"
                onClick={() => void loadArticles(true)}
                disabled={refreshing}
                title="Làm mới bài viết"
                className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-red-800' : ''}`} />
              </button>
            </div>
          </div>

          {/* CHUYÊN MỤC THỰC TẾ TRÍCH XUẤT TỪ BÀI VIẾT */}
          {availableCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3">
              <span className="mr-1 text-xs font-semibold text-stone-400">Chuyên mục:</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('Tất cả')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === 'Tất cả'
                    ? 'bg-red-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Tất cả ({articles.length})
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-red-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* THÔNG BÁO LỖI NẾU CÓ */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadArticles()}
            className="mt-2 text-xs font-bold underline"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* SỐ LƯỢNG KẾT QUẢ TÌM KIẾM */}
      {articles.length > 0 && (
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div>
            Hiển thị <strong className="text-stone-800">{filteredArticles.length}</strong> bài viết
            {selectedCategory !== 'Tất cả' && <span> trong chuyên mục <strong>{selectedCategory}</strong></span>}
            {searchQuery && <span> khớp với <em>"{searchQuery}"</em></span>}
          </div>
          {(selectedCategory !== 'Tất cả' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSearchQuery('');
              }}
              className="text-red-900 underline hover:text-red-700"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* DANH SÁCH BÀI VIẾT (LƯỚI THẺ) */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="h-4 w-24 rounded bg-stone-200" />
              <div className="h-6 w-3/4 rounded bg-stone-200" />
              <div className="h-12 w-full rounded bg-stone-100" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-stone-200" />
                <div className="h-5 w-16 rounded-full bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        /* TRẠNG THÁI RỖNG THỰC TẾ KHI CHƯA CÓ BÀI VIẾT NÀO */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-sm">
          <FolderOpen className="mx-auto h-14 w-14 text-stone-300" />
          <h3 className="mt-3 font-serif text-lg font-bold text-stone-800">
            Tàng Thư hiện chưa có bài viết
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            {isAdmin ? (
              <>
                Xin chào <strong>{ADMIN_EMAIL}</strong>. Bạn đang đăng nhập với tư cách Quản trị viên. Hãy bấm nút bên dưới để tạo bài khảo cứu đầu tiên.
              </>
            ) : (
              <>
                Kho tư liệu đang được biên soạn. Để đóng góp hoặc quản lý bài viết, vui lòng đăng nhập bằng tài khoản quản trị viên ({ADMIN_EMAIL}).
              </>
            )}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-900 to-red-800 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-red-800 hover:to-red-700 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Soạn bài viết đầu tiên</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center gap-2 rounded-xl border border-red-900/30 bg-red-50 px-4 py-2 text-xs font-semibold text-red-900 hover:bg-red-100"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập tài khoản quản trị</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-stone-300" />
          <h3 className="mt-2 font-serif text-base font-bold text-stone-800">Không tìm thấy bài viết phù hợp</h3>
          <p className="mt-1 text-xs text-stone-500">
            Thử tìm bằng từ khóa khác hoặc xóa bộ lọc chuyên mục/thẻ.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Tất cả');
              setSearchQuery('');
            }}
            className="mt-3 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
          >
            Xem tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map(article => (
            <article
              key={article.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#ebdcdc] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-800/40 hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Header thẻ: chuyên mục & nút quản trị */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                    {article.category}
                  </span>

                  {/* CÁC NÚT SỬA & XÓA - CHỈ HIỂN THỊ KHI LÀ ADMIN cthang429@gmail.com */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 opacity-90 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenEditModal(article);
                        }}
                        title="Chỉnh sửa bài viết"
                        className="rounded-md border border-stone-200 p-1 text-stone-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          void handleDeleteArticle(article.id, article.title);
                        }}
                        title="Xóa bài viết"
                        className="rounded-md border border-stone-200 p-1 text-stone-600 hover:border-red-400 hover:bg-red-50 hover:text-red-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tiêu đề */}
                <h3
                  onClick={() => handleOpenArticle(article)}
                  className="cursor-pointer font-serif text-lg font-bold leading-snug text-oriental-crimson transition group-hover:text-red-700"
                >
                  {article.title}
                </h3>

                {/* Tóm tắt */}
                <p className="text-xs leading-relaxed text-stone-600 line-clamp-3">
                  {article.summary}
                </p>

                {/* Các thẻ gom nhóm (Tags) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {article.tags?.slice(0, 4).map(tag => (
                    <span key={tag} className="rounded-full bg-red-50/70 px-2 py-0.5 text-[11px] font-medium text-red-900">
                      #{tag}
                    </span>
                  ))}
                  {article.tags && article.tags.length > 4 && (
                    <span className="text-[11px] text-stone-400">+{article.tags.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Chân thẻ: Thông tin phụ & Nút đọc */}
              <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] text-stone-500">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-stone-700">{article.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime || 5}p
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.viewCount || 0}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenArticle(article)}
                  className="inline-flex items-center gap-1 font-semibold text-red-900 transition group-hover:translate-x-0.5 hover:text-red-700"
                >
                  <span>Đọc bài</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && filteredArticles.length > ARTICLES_PER_PAGE && (
        <nav aria-label="Phân trang bài viết" className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">
            Trang trước
          </button>
          <span className="px-2 text-xs text-stone-500">Trang {currentPage} / {totalPages}</span>
          <button type="button" onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">
            Trang sau
          </button>
        </nav>
      )}

      {/* MODAL ĐỌC CHI TIẾT BÀI VIẾT (READER MODAL) */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-stone-200 bg-[#fffdfb] p-6 shadow-2xl sm:p-10">
            {/* Nút thao tác trên cùng */}
            <div className="sticky top-0 float-right -mr-2 -mt-2 flex items-center gap-2 z-10">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = activeArticle;
                      setActiveArticle(null);
                      handleOpenEditModal(toEdit);
                    }}
                    title="Chỉnh sửa bài viết"
                    className="rounded-full bg-amber-100 p-2 text-amber-900 hover:bg-amber-200"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteArticle(activeArticle.id, activeArticle.title)}
                    title="Xóa bài viết"
                    className="rounded-full bg-red-100 p-2 text-red-900 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Header bài viết */}
            <div className="space-y-3 border-b border-stone-200 pb-6 pr-16">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                  {activeArticle.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(activeArticle.createdAt)}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="h-3.5 w-3.5" />
                  {activeArticle.readTime} phút đọc
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Eye className="h-3.5 w-3.5" />
                  {activeArticle.viewCount} lượt xem
                </span>
              </div>

              <h1 className="font-serif text-2xl font-bold leading-tight text-oriental-crimson sm:text-3xl md:text-4xl">
                {activeArticle.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="text-sm text-stone-600">
                  Tác giả / Biên soạn: <strong className="text-stone-800">{activeArticle.author}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => handleShareArticle(activeArticle)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Đã sao chép liên kết!' : 'Chia sẻ'}</span>
                </button>
              </div>

              {/* Tags gom nhóm */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-xs text-stone-500">Thẻ bài viết:</span>
                {activeArticle.tags?.map(tag => (
                  <span key={tag} className="rounded-full bg-red-100/70 px-2.5 py-0.5 text-xs font-medium text-red-900">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Nội dung bài viết với định dạng Markdown */}
            <div className="prose prose-stone max-w-none py-6 leading-relaxed text-stone-800 font-serif sm:text-lg">
              {activeArticle.content.split('\n\n').map((block, idx) => {
                const trimmed = block.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('# ')) {
                  return (
                    <h2 key={idx} className="mt-8 mb-4 font-serif text-2xl font-bold text-red-950 sm:text-3xl border-b border-red-900/10 pb-2">
                      {trimmed.slice(2)}
                    </h2>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h3 key={idx} className="mt-6 mb-3 font-serif text-xl font-bold text-red-900 sm:text-2xl">
                      {trimmed.slice(3)}
                    </h3>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h4 key={idx} className="mt-4 mb-2 font-serif text-lg font-bold text-amber-900">
                      {trimmed.slice(4)}
                    </h4>
                  );
                }
                if (trimmed.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="my-4 border-l-4 border-red-800 bg-red-50/50 p-4 italic text-stone-700">
                      {trimmed.slice(2)}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  const items = trimmed.split('\n');
                  return (
                    <ul key={idx} className="my-4 list-disc pl-5 space-y-1.5 text-sm sm:text-base font-sans">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="my-4 text-justify leading-7 text-stone-800 text-sm sm:text-base font-sans">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOẠN / SỬA BÀI VIẾT (CHỈ DÀNH CHO ADMIN cthang429@gmail.com) */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setEditingArticle(null);
              }}
              className="sticky top-0 float-right -mr-2 -mt-2 rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <ShieldCheck className="h-4 w-4" />
                <span>Quyền Quản Trị ({ADMIN_EMAIL})</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-oriental-crimson">
                {editingArticle ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}
              </h2>
              <p className="text-xs text-stone-500">
                Bài viết sẽ được lưu trữ trực tuyến vào Cloud Firestore và xuất hiện công khai trên Tàng Thư.
              </p>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Tiêu đề bài viết <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="mt-1.5 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-red-800 focus:outline-none"
                />
              </div>

              {/* Chuyên mục & Tác giả */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Chuyên mục <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    placeholder="Gõ hoặc chọn chuyên mục (VD: Tử Vi, Kinh Dịch...)"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-red-800 focus:outline-none"
                  />
                  <datalist id="category-suggestions">
                    {availableCategories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Tác giả / Nguồn
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={e => setFormAuthor(e.target.value)}
                    placeholder="Tên tác giả hoặc tài liệu..."
                    className="mt-1.5 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-red-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tóm tắt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Tóm tắt ngắn (1-2 câu)
                </label>
                <input
                  type="text"
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                  placeholder="Khái quát nội dung bài viết..."
                  className="mt-1.5 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-red-800 focus:outline-none"
                />
              </div>

              {/* THẺ PHÂN LOẠI (TAGS) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Thẻ gom nhóm (Tags) <span className="text-red-600">*</span>
                </label>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-stone-300 p-2.5 bg-stone-50/50">
                  {formTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-900"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-700 hover:text-red-950"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder={formTags.length === 0 ? 'Gõ thẻ rồi nhấn Enter...' : 'Gõ thêm thẻ khác...'}
                    className="min-w-[140px] flex-1 bg-transparent p-1 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Nội dung bài viết <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-xs font-semibold text-red-900 underline"
                  >
                    {previewMode ? 'Chuyển sang soạn thảo' : 'Xem trước định dạng'}
                  </button>
                </div>

                {previewMode ? (
                  <div className="mt-1.5 max-h-72 min-h-[160px] overflow-y-auto rounded-xl border border-stone-300 bg-stone-50 p-4 font-serif text-sm leading-relaxed text-stone-800">
                    {formContent ? (
                      formContent.split('\n\n').map((p, idx) => <p key={idx} className="my-2">{p}</p>)
                    ) : (
                      <span className="text-stone-400 italic">Chưa có nội dung để xem trước...</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    required
                    rows={8}
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="Soạn nội dung bài viết. Bạn có thể dùng định dạng Markdown cơ bản (# Tiêu đề lớn, ## Tiêu đề nhỏ, - Gạch đầu dòng, > Trích dẫn)..."
                    className="mt-1.5 w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-red-800 focus:outline-none font-sans"
                  />
                )}
              </div>

              {/* Nút Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingArticle(null);
                  }}
                  className="rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-900 to-red-800 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-red-800 hover:to-red-700 disabled:opacity-50 sm:text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4" />
                      <span>{editingArticle ? 'Lưu chỉnh sửa' : 'Đăng bài viết'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
