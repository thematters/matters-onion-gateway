const LANG_ZH_HANT = 'zh-Hant'
const LANG_ZH_HANS = 'zh-Hans'
const LANG_EN = 'en'

const messages = {
  [LANG_ZH_HANT]: {
    articleLookup: '探索 Matters',
    articleNotActive: '文章不是 active 狀態',
    articleNotFound: '找不到文章',
    articleNotPublic: '文章不是公開文章',
    browseByChannel: '依頻道瀏覽',
    canonicalSource: '原始來源',
    channelDerivedLatest: '頻道近作',
    channelNotFound: '找不到頻道',
    contentIdentifiers: '內容識別碼',
    displayName: '顯示名稱',
    ipfsVerifyTitle: '內容指紋與驗證',
    ipfsFingerprintIntro: 'dataHash 是這篇文章內容在 IPFS 上的內容指紋（CID）。相同內容必然產生相同 CID，因此只要 CID 一致，就代表內容沒有被竄改。',
    ipfsVerifyHow: '你可以把上方的 CID 貼到任一個獨立的 IPFS gateway 自行比對，不必只信任這個小站的回傳。',
    enterArticle: '請輸入 Matters 文章連結或 hash。',
    enterAuthor: '請輸入作者 ID 或暱稱。',
    enterSearch: '請輸入搜尋關鍵字。',
    discover: '探索',
    discoverExampleSummary: '可輸入作者 ID、暱稱、關鍵字、文章連結或 IPFS CID',
    discoverExamples: ['作者 ID hi176', '暱稱 自由寫', '關鍵字 Matters Lab', '文章連結 https://matters.town/a/...', 'IPFS CID bafy...'],
    home: '首頁',
    intro: '全球的馬特市民都可以不留痕跡的從洋蔥網路造訪 Matters',
    ipfsUnavailable: '設定的 IPFS gateway 暫時無法取得內容。',
    latestPublicArticles: '公開文章近作',
    leaveTitle: '即將離開洋蔥小站',
    leaveWarning: '這個連結會把你帶到 clearnet（一般網路）。離開洋蔥入口後，目標網站可能看到你的網路位置與瀏覽行為。確定要繼續嗎？',
    leaveExternalUrl: '目標連結',
    leaveContinue: '仍要前往這個外部連結',
    leaveBackHome: '留在洋蔥小站',
    leaveInvalid: '無法辨識的外部連結。',
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
    readPublicArticles: '唯讀列表，資料來自 Matters 公開頻道。',
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
    whyOnionCta: '了解 onion 入口如何保護閱讀',
    whyOnionIntro: '這個小站只處理公開內容，目標是讓讀者在不登入主站的情況下，用更少外部請求、更少瀏覽痕跡閱讀 Matters。',
    whyOnionBlocks: [
      {
        title: '降低連線暴露',
        body: '讀者透過 onion 入口連線時，不需要把自己的網路位置直接暴露給一般網站路徑。Tor 的多層轉送會降低來源識別風險。',
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
    userName: '作者 ID',
  },
  [LANG_ZH_HANS]: {
    articleLookup: '探索 Matters',
    articleNotActive: '文章不是 active 状态',
    articleNotFound: '找不到文章',
    articleNotPublic: '文章不是公开文章',
    browseByChannel: '按频道浏览',
    canonicalSource: '原始来源',
    channelDerivedLatest: '频道近作',
    channelNotFound: '找不到频道',
    contentIdentifiers: '内容标识码',
    displayName: '显示名称',
    ipfsVerifyTitle: '内容指纹与验证',
    ipfsFingerprintIntro: 'dataHash 是这篇文章内容在 IPFS 上的内容指纹（CID）。相同内容必然产生相同 CID，因此只要 CID 一致，就代表内容没有被篡改。',
    ipfsVerifyHow: '你可以把上方的 CID 贴到任一个独立的 IPFS gateway 自行比对，不必只信任这个小站的返回。',
    enterArticle: '请输入 Matters 文章链接或 hash。',
    enterAuthor: '请输入作者 ID 或昵称。',
    enterSearch: '请输入搜索关键词。',
    discover: '探索',
    discoverExampleSummary: '可输入作者 ID、昵称、关键词、文章链接或 IPFS CID',
    discoverExamples: ['作者 ID hi176', '昵称 自由写', '关键词 Matters Lab', '文章链接 https://matters.town/a/...', 'IPFS CID bafy...'],
    home: '首页',
    intro: '全球的马特市民都可以不留痕迹地从洋葱网络访问 Matters',
    ipfsUnavailable: '配置的 IPFS gateway 暂时无法取得内容。',
    latestPublicArticles: '公开文章近作',
    leaveTitle: '即将离开洋葱小站',
    leaveWarning: '这个链接会把你带到 clearnet（一般网络）。离开洋葱入口后，目标网站可能看到你的网络位置与浏览行为。确定要继续吗？',
    leaveExternalUrl: '目标链接',
    leaveContinue: '仍要前往这个外部链接',
    leaveBackHome: '留在洋葱小站',
    leaveInvalid: '无法识别的外部链接。',
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
    readPublicArticles: '只读列表，数据来自 Matters 公开频道。',
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
    whyOnionCta: '了解 onion 入口如何保护阅读',
    whyOnionIntro: '这个小站只处理公开内容，目标是让读者在不登录主站的情况下，用更少外部请求、更少浏览痕迹阅读 Matters。',
    whyOnionBlocks: [
      {
        title: '降低连接暴露',
        body: '读者通过 onion 入口连接时，不需要把自己的网络位置直接暴露给一般网站路径。Tor 的多层转送会降低来源识别风险。',
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
    userName: '作者 ID',
  },
  [LANG_EN]: {
    articleLookup: 'Explore Matters',
    articleNotActive: 'The article is not active.',
    articleNotFound: 'Article not found.',
    articleNotPublic: 'The article is not public.',
    browseByChannel: 'Browse by channel',
    canonicalSource: 'Canonical source',
    channelDerivedLatest: 'Recent channel articles',
    channelNotFound: 'Channel not found.',
    contentIdentifiers: 'Content identifiers',
    displayName: 'Display name',
    ipfsVerifyTitle: 'Content fingerprint and verification',
    ipfsFingerprintIntro: 'dataHash is the IPFS content fingerprint (CID) of this article. Identical content always produces the same CID, so a matching CID means the content has not been altered.',
    ipfsVerifyHow: 'You can paste the CID above into any independent IPFS gateway to verify it yourself, instead of trusting only this gateway’s response.',
    enterArticle: 'Enter a Matters article URL or hash.',
    enterAuthor: 'Enter an author ID or display name.',
    enterSearch: 'Enter a search keyword.',
    discover: 'Explore',
    discoverExampleSummary: 'Try an author ID, display name, keyword, article URL, or IPFS CID',
    discoverExamples: ['Author ID hi176', 'Display name Freewrite', 'Keyword Matters Lab', 'Article URL https://matters.town/a/...', 'IPFS CID bafy...'],
    home: 'Home',
    intro: 'Matters citizens around the world can visit Matters through the onion network without leaving a trail.',
    ipfsUnavailable: 'The configured IPFS gateway cannot fetch the content right now.',
    latestPublicArticles: 'Recent public articles',
    leaveTitle: 'Leaving the onion gateway',
    leaveWarning: 'This link goes to the clearnet (the ordinary web). Once you leave the onion gateway, the destination site may see your network location and browsing behavior. Continue?',
    leaveExternalUrl: 'Destination link',
    leaveContinue: 'Continue to this external link',
    leaveBackHome: 'Stay on the onion gateway',
    leaveInvalid: 'Unrecognized external link.',
    license: 'License',
    lookupInput: 'Lookup input',
    methodNotAllowed: 'Method not allowed.',
    noReadableArticles: 'No readable public articles were returned.',
    noSearchResults: 'No matching authors were returned.',
    noIpfsCid: 'The API did not return an IPFS CID.',
    noindex: 'Noindex',
    notFound: 'Page not found.',
    open: 'Open',
    openIpfs: 'Open IPFS CID through gateway',
    publicArticle: 'Public Matters article',
    publicChannel: 'Public channel',
    publicChannels: 'Public channels',
    readPublicArticles: 'Read-only list from public Matters channels.',
    recentAuthorArticles: 'Recent author articles',
    requestFailed: 'Request failed.',
    returnToLookup: 'Back to lookup',
    sampledArticles: 'sample articles',
    search: 'Search',
    searchAgain: 'Search again',
    searchArticles: 'Search public articles',
    searchAuthors: 'Search authors',
    searchAuthorsPlaceholder: 'Author ID, display name, or nickname',
    searchPlaceholder: 'Keyword, title, author, or topic',
    sourceUnknown: 'Unknown author',
    state: 'State',
    summaryAuthorSearch: (count) => `Matters returned ${count} author results.`,
    summaryDiscover: (articleCount, authorCount) =>
      `Found ${articleCount} public articles and ${authorCount} author results.`,
    summarySearch: (total, shown) => `Matters returned ${total} public results. Showing the first ${shown} readable articles.`,
    siteName: 'Matters Onion Gateway',
    whyOnion: 'Why an onion gateway',
    whyOnionCta: 'Learn how the onion gateway protects reading',
    whyOnionIntro: 'This gateway only handles public content. It helps readers access Matters without logging in to the main site, while reducing external requests and browsing traces.',
    whyOnionBlocks: [
      {
        title: 'Lower connection exposure',
        body: 'When readers connect through the onion gateway, their network location is not exposed directly to the ordinary website path. Tor relays reduce source identification risk.',
      },
      {
        title: 'No main-site login',
        body: 'The gateway only reads public Matters articles, authors, and channel data. It does not require accounts, create sessions, or store reading history.',
      },
      {
        title: 'Fewer third-party requests',
        body: 'Pages do not load third-party JavaScript. Images go through the local proxy, and article content is sanitized before rendering.',
      },
    ],
    userName: 'Author ID',
  },
}

export function resolveLanguage({ searchParams, headers } = {}) {
  const requested = searchParams?.get('lang')
  if (requested === LANG_EN || /^en\b/i.test(requested || '')) {
    return LANG_EN
  }

  if (requested === LANG_ZH_HANS || requested === 'zh-CN' || requested === 'zh-Hans') {
    return LANG_ZH_HANS
  }

  if (requested === LANG_ZH_HANT || requested === 'zh-TW' || requested === 'zh-Hant') {
    return LANG_ZH_HANT
  }

  const acceptLanguage = headers?.get?.('accept-language') || ''
  if (/^en\b/i.test(acceptLanguage)) {
    return LANG_EN
  }

  if (/zh-(cn|sg|hans)/i.test(acceptLanguage)) {
    return LANG_ZH_HANS
  }

  return LANG_ZH_HANT
}

export function getMessages(lang) {
  return messages[lang] || messages[LANG_ZH_HANT]
}

export function isDefaultLanguage(lang) {
  return lang === LANG_ZH_HANT
}

export const languages = {
  traditional: LANG_ZH_HANT,
  simplified: LANG_ZH_HANS,
  english: LANG_EN,
}
