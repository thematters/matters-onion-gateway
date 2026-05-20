const LANG_ZH_HANT = 'zh-Hant'
const LANG_ZH_HANS = 'zh-Hans'

const messages = {
  [LANG_ZH_HANT]: {
    anonymousGateway: '匿名唯讀閘道',
    articleLookup: '文章連結、作者、關鍵字或 IPFS CID',
    articleNotActive: '文章不是 active 狀態',
    articleNotFound: '找不到文章',
    articleNotPublic: '文章不是公開文章',
    browseByChannel: '依頻道瀏覽',
    canonicalSource: '原始來源',
    channelDerivedLatest: '頻道近作',
    channelNotFound: '找不到頻道',
    contentIdentifiers: '內容識別碼',
    displayName: '顯示名稱',
    enterArticle: '請輸入 Matters 文章連結或 hash。',
    enterAuthor: '請輸入作者 ID 或暱稱。',
    enterSearch: '請輸入搜尋關鍵字。',
    discover: '探索',
    discoverPlaceholder: '文章連結、IPFS CID、作者 ID、暱稱或關鍵字',
    home: '首頁',
    infoBlocks: [
      {
        title: '降低連線暴露',
        body: '使用 onion 入口時，讀者不需要把自己的網路位置直接暴露給一般網站路徑。Tor 會用多層轉送降低來源識別風險。',
      },
      {
        title: '不需要登入主站',
        body: '小站只讀取 Matters 已公開的文章、作者與頻道資料。不要求帳號、不建立 session，也不保存閱讀紀錄。',
      },
      {
        title: '減少第三方請求',
        body: '頁面不載入第三方 JavaScript，圖片走站內代理，文章內容會先清理再顯示，避免讀者瀏覽時額外外連。',
      },
    ],
    intro:
      '一個給公開閱讀使用的 onion 入口。不登入、不載入追蹤腳本、不做全站鏡像。',
    ipfsUnavailable: '設定的 IPFS gateway 暫時無法取得內容。',
    latestPublicArticles: '公開文章近作',
    license: '授權',
    lookupInput: '查詢輸入',
    methodNotAllowed: '不支援的請求方法',
    noReadableArticles: '沒有回傳可閱讀的公開文章。',
    noSearchResults: '沒有回傳符合的作者。',
    noIpfsCid: 'API 沒有回傳 IPFS CID。',
    noindex: 'Noindex',
    notFound: '找不到頁面',
    open: '開啟',
    openIpfs: '透過 gateway 開啟 IPFS CID',
    publicArticle: 'Matters 公開文章',
    publicChannel: '公開頻道',
    publicChannels: '公開頻道',
    readPublicArticles: '匿名唯讀列表，資料來自 Matters 公開頻道。',
    recentAuthorArticles: '作者近作',
    requestFailed: '請求失敗',
    returnToLookup: '回到查詢',
    sampledArticles: '篇取樣文章',
    search: '搜尋',
    searchAgain: '再次搜尋',
    searchArticles: '搜尋公開文章',
    searchAuthors: '搜尋作者',
    searchAuthorsPlaceholder: '作者 ID、暱稱或顯示名稱',
    searchPlaceholder: '關鍵字、標題、作者或主題',
    sourceUnknown: '未知作者',
    state: '狀態',
    summaryAuthorSearch: (count) => `Matters 搜尋回報 ${count} 個作者結果。`,
    summaryDiscover: (articleCount, authorCount) =>
      `找到 ${articleCount} 篇公開文章與 ${authorCount} 個作者結果。`,
    summarySearch: (total, shown) => `Matters 搜尋回報 ${total} 筆公開結果，目前顯示前 ${shown} 篇可閱讀文章。`,
    siteName: 'Matters 馬特市洋蔥小站',
    whyOnion: '為何需要 onion 入口',
    userName: '作者 ID',
  },
  [LANG_ZH_HANS]: {
    anonymousGateway: '匿名只读网关',
    articleLookup: '文章链接、作者、关键词或 IPFS CID',
    articleNotActive: '文章不是 active 状态',
    articleNotFound: '找不到文章',
    articleNotPublic: '文章不是公开文章',
    browseByChannel: '按频道浏览',
    canonicalSource: '原始来源',
    channelDerivedLatest: '频道近作',
    channelNotFound: '找不到频道',
    contentIdentifiers: '内容标识码',
    displayName: '显示名称',
    enterArticle: '请输入 Matters 文章链接或 hash。',
    enterAuthor: '请输入作者 ID 或昵称。',
    enterSearch: '请输入搜索关键词。',
    discover: '探索',
    discoverPlaceholder: '文章链接、IPFS CID、作者 ID、昵称或关键词',
    home: '首页',
    infoBlocks: [
      {
        title: '降低连接暴露',
        body: '使用 onion 入口时，读者不需要把自己的网络位置直接暴露给一般网站路径。Tor 会用多层转送降低来源识别风险。',
      },
      {
        title: '不需要登录主站',
        body: '小站只读取 Matters 已公开的文章、作者与频道数据。不要求账号、不建立 session，也不保存阅读记录。',
      },
      {
        title: '减少第三方请求',
        body: '页面不加载第三方 JavaScript，图片走站内代理，文章内容会先清理再显示，避免读者浏览时额外外连。',
      },
    ],
    intro:
      '一个给公开阅读使用的 onion 入口。不登录、不加载追踪脚本、不做全站镜像。',
    ipfsUnavailable: '配置的 IPFS gateway 暂时无法取得内容。',
    latestPublicArticles: '公开文章近作',
    license: '授权',
    lookupInput: '查询输入',
    methodNotAllowed: '不支持的请求方法',
    noReadableArticles: '没有返回可阅读的公开文章。',
    noSearchResults: '没有返回符合的作者。',
    noIpfsCid: 'API 没有返回 IPFS CID。',
    noindex: 'Noindex',
    notFound: '找不到页面',
    open: '打开',
    openIpfs: '通过 gateway 打开 IPFS CID',
    publicArticle: 'Matters 公开文章',
    publicChannel: '公开频道',
    publicChannels: '公开频道',
    readPublicArticles: '匿名只读列表，数据来自 Matters 公开频道。',
    recentAuthorArticles: '作者近作',
    requestFailed: '请求失败',
    returnToLookup: '回到查询',
    sampledArticles: '篇取样文章',
    search: '搜索',
    searchAgain: '再次搜索',
    searchArticles: '搜索公开文章',
    searchAuthors: '搜索作者',
    searchAuthorsPlaceholder: '作者 ID、昵称或显示名称',
    searchPlaceholder: '关键词、标题、作者或主题',
    sourceUnknown: '未知作者',
    state: '状态',
    summaryAuthorSearch: (count) => `Matters 搜索返回 ${count} 个作者结果。`,
    summaryDiscover: (articleCount, authorCount) =>
      `找到 ${articleCount} 篇公开文章与 ${authorCount} 个作者结果。`,
    summarySearch: (total, shown) => `Matters 搜索返回 ${total} 条公开结果，目前显示前 ${shown} 篇可阅读文章。`,
    siteName: 'Matters 马特市洋葱小站',
    whyOnion: '为什么需要 onion 入口',
    userName: '作者 ID',
  },
}

export function resolveLanguage({ searchParams, headers } = {}) {
  const requested = searchParams?.get('lang')
  if (requested === LANG_ZH_HANS || requested === 'zh-CN' || requested === 'zh-Hans') {
    return LANG_ZH_HANS
  }

  if (requested === LANG_ZH_HANT || requested === 'zh-TW' || requested === 'zh-Hant') {
    return LANG_ZH_HANT
  }

  const acceptLanguage = headers?.get?.('accept-language') || ''
  if (/zh-(cn|sg|hans)/i.test(acceptLanguage)) {
    return LANG_ZH_HANS
  }

  return LANG_ZH_HANT
}

export function getMessages(lang) {
  return messages[lang] || messages[LANG_ZH_HANT]
}

export function isSimplified(lang) {
  return lang === LANG_ZH_HANS
}

export const languages = {
  traditional: LANG_ZH_HANT,
  simplified: LANG_ZH_HANS,
}
