import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'GitHub Blind Reviews',
    description:
      'Hide user names and avatars on GitHub pull requests, issues, comments, and commits to reduce review bias.',
    permissions: ['storage'],
    host_permissions: ['https://github.com/*'],
    icons: {
      '16': '/icons/icon16.png',
      '48': '/icons/icon48.png',
      '128': '/icons/icon128.png',
    },
    action: {
      default_icon: {
        '16': '/icons/icon16.png',
        '48': '/icons/icon48.png',
        '128': '/icons/icon128.png',
      },
    },
  },
});
