module.exports = {
  dest: '../dist',
  host: '0.0.0.0',
  port: '8080',
  base: '/',
  title: '一个程序员的自我修养',
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  serviceWorker: true,
  themeConfig: {
    repo: 'zhangjunlei26/zhangjunlei26.github.io',
    editLinks: true,
    docsDir: '/',
    label: '简体中文',
    selectText: '选择语言',
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '上次更新',
    nav: [
      {
        text: '专栏笔记',
        link: '/notes/',
      },
      {
        text: 'Cheatsheet',
        link: '/cheatsheet/'
      },
      {
        text: '日常杂记',
        link: '/others/'
      }
    ],
    sidebar: {
      '/notes/': genSidebarConfig('专栏笔记')
    },
  }
}

function genSidebarConfig(title) {
  return [
    {
      title,
      collapsable: false,
      children: [
        '',
        'web',
        'program',
        'mobile',
        'database',
        'os',
        'tool',
        'develop',
      ]
    }
  ]
}
