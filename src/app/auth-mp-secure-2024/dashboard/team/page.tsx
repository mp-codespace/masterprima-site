// File path: src/app/auth-mp-secure-2024/dashboard/team/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  member_id: string;
  name: string;
  role: string;
  image_url: string | null;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth-mp-secure-2024/team');
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      const data: TeamMember[] = await response.json();
      setTeamMembers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Team Members</h1>
          <p className="text-neutral-dark-gray mt-1">Manage your team profiles and information.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-orange/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
            ))}
        </div>
      )}

      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.member_id} className="bg-white p-5 rounded-xl border border-gray-200 text-center relative group">
                <div className="absolute top-2 right-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4"/>
                    </button>
                </div>
              <Image
                src={member.image_url || 'https://placehold.co/128x128/f18546/ffffff?text=MP'}
                alt={member.name}
                width={128}
                height={128}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-bold text-lg text-neutral-charcoal">{member.name}</h3>
              <p className="text-sm text-primary-orange font-medium">{member.role}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 text-sm text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" /> Edit
                  </button>
                   <button className="flex-1 text-sm text-gray-600 hover:text-red-600 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && teamMembers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <Users className="w-16 h-16 mx-auto mb-2 text-gray-300"/>
                <h4 className="font-semibold text-lg text-gray-700">No Team Members Found</h4>
                <p className="text-sm text-gray-500 mt-1">Get started by adding your first team member.</p>
            </div>
      )}
    </div>
  );
}
