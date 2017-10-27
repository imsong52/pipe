import vueAxios from '~/plugins/axios'

export const state = () => ({
  locale: 'zh_CN',
  version: '1.0.0',
  isInit: true,
  name: '',
  nickname: '',
  blogTitle: '',
  avatarURL: '',
  blogURL: '/',
  role: 3, // 0-no login, 1-admin, 2-blog admin, 3-blog user, 4-visitor
  blogs: [{
    title: '',
    id: ''
  }],
  snackMsg: '',
  snackBar: false,
  snackModify: 'error',
  menu: [],
  tagsItems: []
})

export const mutations = {
  setMenu (state, data) {
    state.menu = data
  },
  setStatus (state, data) {
    if (data === null) {
      state.name = ''
      state.nickname = ''
      state.blogTitle = ''
      state.blogURL = '/'
      state.role = 3
      state.avatarURL = ''
      state.blogs = [{
        title: '',
        id: ''
      }]
      localStorage.removeItem('userInfo')
      return
    }

    state.locale = data.locale
    state.version = data.version
    state.isInit = data.inited

    if (data.name !== '' && data.inited) {
      state.name = data.name
      state.nickname = data.nickname
      state.blogTitle = data.blogTitle
      state.blogURL = data.blogURL
      state.role = data.role
      state.blogs = data.blogs
      state.avatarURL = data.avatarURL
      localStorage.setItem('userInfo', JSON.stringify(data))
    } else {
      state.name = ''
      state.nickname = ''
      state.blogTitle = ''
      state.blogURL = '/'
      state.role = 3
      state.avatarURL = ''
      state.blogs = [{
        title: '',
        id: ''
      }]
      localStorage.removeItem('userInfo')
    }
  },
  setLocale (state, locale) {
    state.locale = locale
  },
  setIsInit (state, isInit) {
    state.isInit = isInit
  },
  setBlog (state, data) {
    const userInfo = localStorage.getItem('userInfo')
    if (!userInfo) {
      return
    }
    const userInfoJSON = JSON.parse(userInfo)
    if (data) {
      state.blogTitle = data.title
      state.blogURL = data.path
      state.role = data.role
      userInfoJSON.blogURL = data.path
      userInfoJSON.blogTitle = data.title
      userInfoJSON.role = data.role
    } else {
      state.blogTitle = ''
      state.blogURL = '/'
      state.role = 3
      userInfoJSON.blogURL = '/'
      userInfoJSON.blogTitle = ''
      userInfoJSON.role = 3
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfoJSON))
  },
  setSnackBar (state, data) {
    state.snackBar = data.snackBar
    state.snackMsg = data.snackMsg
    if (data.snackModify) {
      state.snackModify = data.snackModify
    } else {
      state.snackModify = 'error'
    }
  },
  setTagsItems (state, data) {
    state.tagsItems = data
  }
}

export const actions = {
  async nuxtClientInit ({commit}, {app}) {
    try {
      const responseData = await vueAxios().get('/status')
      if (responseData) {
        if (app.i18n.messages[responseData.locale]) {
          app.i18n.locale = responseData.locale
        } else {
          const message = require(`../../i18n/${responseData.locale}.json`)
          app.i18n.setLocaleMessage(responseData.locale, message)
        }
        commit('setStatus', responseData)
      }
    } catch (e) {
      console.error(e)
    }
  },
  setLocaleMessage ({commit}, locale) {
    if (this.app.i18n.messages[locale]) {
      this.app.i18n.locale = locale
    } else {
      const message = require(`../../i18n/${locale}.json`)
      this.app.i18n.setLocaleMessage(locale, message)
    }
    commit('setLocale', locale)
  },
  async getTags ({commit, state}) {
    if (state.tagsItems.length > 0) {
      return
    }
    const tagResponseData = await vueAxios().get('/console/tags/')
    if (tagResponseData) {
      let tagList = []
      tagResponseData.map((v) => {
        tagList.push(v.title)
      })
      commit('setTagsItems', tagList)
    }
  }
}
