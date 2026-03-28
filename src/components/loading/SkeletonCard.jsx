'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton circle width={120} height={120} className="skeleton-custom" />
        <Skeleton width={200} height={28} className="skeleton-custom" />
        <Skeleton width={150} height={20} className="skeleton-custom" />
        <Skeleton width={280} height={16} count={2} className="skeleton-custom" />
        <div className="flex gap-3 mt-4">
          <Skeleton width={100} height={36} className="skeleton-custom rounded-full" />
          <Skeleton width={100} height={36} className="skeleton-custom rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProjectSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <Skeleton height={200} className="skeleton-custom" />
          <div className="p-4 space-y-3">
            <Skeleton width="80%" height={24} className="skeleton-custom" />
            <Skeleton width="100%" height={16} count={2} className="skeleton-custom" />
            <div className="flex gap-2 pt-2">
              <Skeleton width={60} height={24} className="skeleton-custom rounded-full" />
              <Skeleton width={60} height={24} className="skeleton-custom rounded-full" />
              <Skeleton width={60} height={24} className="skeleton-custom rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CertificateSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton height={160} className="skeleton-custom" />
          <div className="p-3 space-y-2">
            <Skeleton width="90%" height={20} className="skeleton-custom" />
            <Skeleton width="60%" height={16} className="skeleton-custom" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <Skeleton circle width={40} height={40} className="skeleton-custom flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton width={120} height={18} className="skeleton-custom" />
              <Skeleton width={60} height={14} className="skeleton-custom" />
            </div>
            <Skeleton width="100%" height={16} count={2} className="skeleton-custom" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommunitySkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg overflow-hidden">
          <Skeleton height="100%" className="skeleton-custom" />
        </div>
      ))}
    </div>
  );
}

export function AboutSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Skeleton width={200} height={32} className="skeleton-custom" />
      <div className="space-y-4">
        <Skeleton width="100%" height={20} count={3} className="skeleton-custom" />
        <Skeleton width="90%" height={20} className="skeleton-custom" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Skeleton width={60} height={40} className="skeleton-custom mx-auto mb-2" />
            <Skeleton width={80} height={16} className="skeleton-custom mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactSkeleton() {
  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Skeleton width={180} height={32} className="skeleton-custom" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton width={100} height={16} className="skeleton-custom" />
          <Skeleton height={48} className="skeleton-custom rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton width={100} height={16} className="skeleton-custom" />
          <Skeleton height={120} className="skeleton-custom rounded-lg" />
        </div>
        <Skeleton width="100%" height={48} className="skeleton-custom rounded-lg" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen p-4 space-y-8">
      <div className="h-16 flex items-center justify-between">
        <Skeleton width={150} height={32} className="skeleton-custom" />
        <Skeleton width={120} height={36} className="skeleton-custom rounded-full" />
      </div>
      <ProfileSkeleton />
      <AboutSkeleton />
      <ProjectSkeleton count={3} />
      <CertificateSkeleton count={4} />
      <CommentSkeleton count={3} />
    </div>
  );
}