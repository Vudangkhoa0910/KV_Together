'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  campaign_id: number;
  campaign_title: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export default function FundraiserPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/fundraiser/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    router.push('/fundraiser/posts/create');
  };

  const handleEditPost = (postId: number) => {
    router.push(`/fundraiser/posts/edit/${postId}`);
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/fundraiser/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý bài viết</h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách các bài viết của bạn về các chiến dịch gây quỹ
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreatePost}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Tạo bài viết mới
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Tiêu đề
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Chiến dịch
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Trạng thái
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Ngày tạo
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Cập nhật
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {post.title}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {post.campaign_title}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(post.updated_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => handleEditPost(post.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 