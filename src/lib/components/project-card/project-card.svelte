<script lang="ts" context="module">
  export const PROJECT_CARD_FRAGMENT = gql`
    ${PROJECT_AVATAR_FRAGMENT}
    ${PROJECT_NAME_FRAGMENT}
    fragment ProjectCard on Project {
      ...ProjectAvatar
      ...ProjectName
      ... on ClaimedProject {
        source {
          forge
          ownerName
          repoName
        }
      }
      ... on UnclaimedProject {
        source {
          forge
          ownerName
          repoName
        }
      }
    }
  `;
</script>

<script lang="ts">
  import buildProjectUrl from '$lib/utils/build-project-url';
  import Github from 'radicle-design-system/icons/Github.svelte';

  import ProjectAvatar, { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
  import ProjectName, { PROJECT_NAME_FRAGMENT } from '../project-badge/components/project-name.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectCardFragment } from './__generated__/gql.generated';
  import isClaimed from '$lib/utils/project/is-claimed';

  export let project: ProjectCardFragment;
</script>

<a class="wrapper" href={buildProjectUrl(project.source.forge, project.source.ownerName, project.source.repoName)}>
  <div class="project-card">
    <div
      class="background"
      style:background-color={isClaimed(project)
        ? 'var(--color-primary-level-2)'
        : 'var(--color-foreground-level-1)'}
    />
    <div class="header">
      <div class="avatar"><ProjectAvatar {project} size="large" outline /></div>
    </div>
    <div class="name-and-description">
      <div class="source">
        <div class="icon">
          <Github style="height: 20px; fill: var(--color-foreground-level-6)" />
        </div>
        <span class="owner-name">{project.source.ownerName}</span>
      </div>
      <h4 class="name"><ProjectName showSource={false} {project} /></h4>
    </div>
  </div>
</a>

<style>
  .wrapper {
    padding: 2px 0;
    margin: -2px 0;
  }

  .project-card {
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem 0.75rem 0.75rem 0.75rem;
    position: relative;
    gap: 1rem;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s, backgorund-color 0.2s, transform 0.2s;
  }

  .wrapper:hover:not(:active) .project-card,
  .wrapper:focus-visible .project-card {
    box-shadow: var(--elevation-medium);
    transform: translateY(-2px);
  }

  .wrapper:focus-visible {
    outline: none;
    background-color: var(--color-foreground-level-1);
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3rem;
    border-radius: 1rem 0 0 0;
  }

  .name-and-description {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: center;
  }

  .source {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    color: var(--color-foreground-level-6);
  }
</style>
