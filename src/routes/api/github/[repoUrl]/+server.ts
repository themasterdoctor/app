import uriDecodeParams from '$lib/utils/url-decode-params';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import GitHub from '$lib/utils/github/GitHub';
import { Octokit } from '@octokit/rest';
import { GITHUB_PERSONAL_ACCESS_TOKEN } from '$env/static/private';
import { getRedis } from './redis';
import { env } from '$env/dynamic/private';

const octokit = new Octokit({ auth: GITHUB_PERSONAL_ACCESS_TOKEN });
const github = new GitHub(octokit);

function mapGhResponse(response: Awaited<ReturnType<(typeof github)['getRepoByUrl']>>) {
  return {
    url: response.html_url,
    description: response.description,
    repoName: response.name,
    ownerName: response.owner.login,
    forksCount: response.forks_count,
    stargazersCount: response.stargazers_count,
    defaultBranch: response.default_branch,
  };
}

export const GET: RequestHandler = async ({ params }) => {
  const { repoUrl } = uriDecodeParams(params);

  const redis = env.CACHE_REDIS_CONNECTION_STRING ? await getRedis() : undefined;

  try {
    const lowercaseRepoUrl = repoUrl.toLowerCase();
    const cachedRepo = redis && (await redis.get(lowercaseRepoUrl));

    if (cachedRepo) {
      const res = mapGhResponse(JSON.parse(cachedRepo));

      return new Response(JSON.stringify(res));
    } else {
      const repo = await github.getRepoByUrl(repoUrl);

      if (redis) {
        await redis.set(lowercaseRepoUrl, JSON.stringify(repo), {
          EX: 864000,
          NX: true,
        });
      }

      return new Response(JSON.stringify(mapGhResponse(repo)));
    }
  } catch (e) {
    const status =
      typeof e === 'object' && e && 'status' in e && typeof e.status === 'number' ? e.status : 500;

    throw error(status);
  }
};
