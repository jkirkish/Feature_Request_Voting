import { prisma } from '@/lib/prisma';
import { FeatureStatus, FeatureRequest, Vote, User } from '@prisma/client';

type FeatureWithRelations = FeatureRequest & {
  user: {
    name: string | null;
    email: string | null;
  };
  votes: Vote[];
};

async function getFeatures() {
  return prisma.featureRequest.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      votes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as Promise<FeatureWithRelations[]>;
}

export default async function AdminFeaturesPage() {
  const features = await getFeatures();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Feature Requests</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {features.map(feature => (
            <li key={feature.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-primary-600 truncate">
                    {feature.title}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feature.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : feature.status === 'PLANNED'
                          ? 'bg-blue-100 text-blue-800'
                          : feature.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {feature.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {feature.user.name || 'Anonymous'}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {feature.user.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>{feature.votes.length} votes</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="mt-4 flex space-x-4">
                  <form
                    action={async (formData: FormData) => {
                      'use server';
                      const status = formData.get('status') as FeatureStatus;
                      await prisma.featureRequest.update({
                        where: { id: feature.id },
                        data: { status },
                      });
                    }}
                    className="flex space-x-2"
                  >
                    <select
                      name="status"
                      defaultValue={feature.status}
                      className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="OPEN">Open</option>
                      <option value="PLANNED">Planned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Update Status
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
