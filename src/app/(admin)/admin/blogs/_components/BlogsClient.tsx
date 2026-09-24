"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  date: string;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export default function BlogsClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Skin Care",
    excerpt: "",
    content: "",
    coverImage: null as File | null,
    coverImageUrl: "",
    authorName: "Prakriti Team",
    authorRole: "Author",
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
  });

  const categories = ["Skin Care", "GIFTING", "WELLNESS", "ROYAL JELLY", "AUTUMN", "FATIGUE", "General"];

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const res = await fetch("/api/ui/blog?all=true");
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      category: "Skin Care",
      excerpt: "",
      content: "",
      coverImage: null,
      coverImageUrl: "",
      authorName: "Prakriti Team",
      authorRole: "Author",
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      isPublished: false,
      isFeatured: false,
      displayOrder: 0,
    });
    setShowModal(true);
  }

  function openEditModal(blog: Blog) {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: null,
      coverImageUrl: blog.coverImage,
      authorName: blog.authorName,
      authorRole: blog.authorRole,
      date: blog.date,
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured,
      displayOrder: blog.displayOrder,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const loadingToast = toast.loading(editingBlog ? "Updating blog..." : "Creating blog...");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("authorName", formData.authorName);
      formDataToSend.append("authorRole", formData.authorRole);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("isPublished", String(formData.isPublished));
      formDataToSend.append("isFeatured", String(formData.isFeatured));
      formDataToSend.append("displayOrder", String(formData.displayOrder));

      if (formData.coverImage) {
        formDataToSend.append("coverImage", formData.coverImage);
      } else if (formData.coverImageUrl) {
        formDataToSend.append("coverImageUrl", formData.coverImageUrl);
      }

      const url = editingBlog ? `/api/ui/blog/${editingBlog.id}` : "/api/ui/blog";
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingBlog ? "Blog updated!" : "Blog created!", { id: loadingToast });
        setShowModal(false);
        fetchBlogs();
      } else {
        toast.error(data.error || "Operation failed", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog", { id: loadingToast });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const loadingToast = toast.loading("Deleting blog...");

    try {
      const res = await fetch(`/api/ui/blog/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Blog deleted!", { id: loadingToast });
        fetchBlogs();
      } else {
        toast.error(data.error || "Delete failed", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog", { id: loadingToast });
    }
  }

  async function togglePublish(id: string) {
    try {
      const res = await fetch(`/api/ui/blog/${id}`, { method: "PATCH" });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      } else {
        toast.error(data.error || "Toggle failed");
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to toggle publish status");
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || blog.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-500">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#b8952e] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Blog Post
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Blog
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="max-w-md">
                        <p className="font-semibold text-gray-900 text-sm">{blog.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{blog.excerpt}</p>
                        {blog.isFeatured && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {blog.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        blog.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(blog.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title={blog.isPublished ? "Unpublish" : "Publish"}
                      >
                        {blog.isPublished ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No blogs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-heading text-gray-900">
                {editingBlog ? "Edit Blog" : "Create New Blog"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL-friendly, auto-generated if empty)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="my-blog-post"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="12 January 2026"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Excerpt (Short Description) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content (HTML) *
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-mono text-sm"
                  placeholder="<p>Your blog content here...</p>"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image *
                </label>
                
                {/* File Upload */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, coverImage: file, coverImageUrl: "" });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-xs text-gray-500 font-semibold">OR</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Image URL (Google, Unsplash, etc.)</label>
                  <input
                    type="url"
                    value={formData.coverImage ? "" : formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value, coverImage: null })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    disabled={!!formData.coverImage}
                  />
                </div>

                {/* Preview */}
                {(formData.coverImageUrl || formData.coverImage) && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <img 
                      src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.coverImageUrl} 
                      alt="Preview" 
                      className="w-full max-w-xs h-32 object-cover rounded border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-[#D4AF37] border-gray-300 rounded focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-700">Featured (Homepage)</span>
                </label>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order (lower = higher priority)
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#D4AF37] text-white rounded-md hover:bg-[#b8952e] transition-colors font-semibold"
                >
                  {editingBlog ? "Update Blog" : "Create Blog"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
