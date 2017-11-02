/**
 * @fileoverview article.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 0.1.0.0, Oct 19, 2017
 */

import $ from 'jquery'
import {
  AddComment,
  InitEditor,
  InitToc,
  LocalStorageInput,
  ReomveComment,
  LazyLoadCSSImage,
  LazyLoadImage,
  PreviewImg
} from '../../../js/common'
import './common'
import hljs from 'highlight.js'

const Article = {
  /**
   * @description 页面初始化
   */
  init: () => {
    Article._initEvent()
    Article._initToc()
    LocalStorageInput('commentContent')
    InitEditor('emotions', 'commentContent')

    $('.content__reset img').click(function () {
      PreviewImg(this)
    });
  },
  _initToc: () => {
    if ($('#toc').length === 1) {
      $('#editor').width($(window).width() - 340)
      InitToc('toc', 'articleContent')
      if ($('body').width() > 768) {
        $('body').addClass('body--side')
      }
    }
  },
  _initEvent: () => {
    $('#articleCommentBtn').click(function () {
      const $this = $(this)
      Article.showComment($this.data('title'), $this.data('id'))
    })

    $('#comments').on('click', '.comment__btn', function () {
      const $this = $(this)
      if ($this.hasClass('commentDelete')) {
        // remove comment
        const $firstBtn = $(this)
        Article.removeComment($firstBtn.data('id'), $firstBtn.data('label'), $firstBtn.data('label2'))
      }

      if ($this.hasClass('commentAdd')) {
        // add reply comment
        const $lastBtn = $(this)
        Article.showComment($lastBtn.data('title'), $lastBtn.data('id'), $lastBtn.data('commentid'))
      }
    })

    $('#comments.comment__null').click(function () {
      const $commentNull = $(this)
      Article.showComment($commentNull.data('title'), $commentNull.data('id'))
    })

    $('#editorAdd').click(function () {
      Article.addComment($(this).data('label'), $(this).data('label2'))
    })

    $('#commentContent').keydown(function (event) {
      if (event.metaKey && 13 === event.keyCode) {
        Article.addComment($('#editorAdd').data('label'), $('#editorAdd').data('label2'))
      }
    }).keypress(function (event) {
      if (event.ctrlKey && 10 === event.charCode) {
        Article.addComment($('#editorAdd').data('label'), $('#editorAdd').data('label2'))
      }
    });

    $('#editorCancel').click(function () {
      Article.hideComment()
    })

  },
  removeComment: (id, label, label2) => {
    if (confirm(label)) {
      ReomveComment(id, () => {
        const $commentsCnt = $('#commentsCnt')
        const $comments = $('#comments')
        const $item = $('#comment' + id)

        if ($comments.find('section').length === 1) {
          $comments.addClass('ft-center comment__null fn-bottom')
            .html(`${label2} <svg><use xlink:href="#comment"></use></svg>`).click(function () {
            const $itemReplyBtn = $item.find('.comment__btn:last')
            Article.showComment($itemReplyBtn.data('title'), $itemReplyBtn.data('id'))
          })
        } else {
          $item.remove()
          $commentsCnt.text(parseInt($commentsCnt.text()) - 1)
        }
      }, (msg) => {
        alert(msg)
      })
    }
  },
  showComment: (reply, id, commentId) => {
    const $editor = $('#editor')
    if ($editor.length === 0) {
      location.href = `${location.origin}/login`
      return false
    }
    if (commentId) {
      $editor.data('commentid', commentId)
    } else {
      $editor.removeData('commentid')
    }
    if ($('body').hasClass('body--side')) {
      $editor.width($(window).width() - 340)
    } else {
      $editor.width('100%')
    }

    $editor.css({'bottom': '0', 'opacity': 1}).data('id', id)
    $('body').css('padding-bottom', $editor.outerHeight() + 'px')
    $('#replyObject').text(reply)
  },
  hideComment: () => {
    const $editor = $('#editor')
    $editor.css({'bottom': `-${$editor.outerHeight()}px`, 'opacity': 0})
    $('body').css('padding-bottom', 0)
  },
  addComment: (label, label2) => {
    const $editor = $('#editor')
    const $editorAdd = $('#editorAdd')
    const $commentContent = $('#commentContent')

    if ($editorAdd.hasClass('disabled')) {
      return;
    }
    if ($.trim($commentContent.val()).length === 0) {
      alert(label2)
      return;
    }

    let requestData = {
      'articleID': $editor.data('id'),
      'content': $commentContent.val()
    }
    if ($editor.data('commentid')) {
      requestData.parentCommentID = $editor.data('commentid')
    }

    $editorAdd.addClass('disabled')

    AddComment($commentContent.data('blogurl'), requestData, (data) => {
      Article.hideComment()
      const $commentsCnt = $('#commentsCnt')
      const $comments = $('#comments')

      if ($commentsCnt.length === 0) {
        $comments.removeClass('ft-center comment__null').removeAttr('onclick')
          .html(`<div class="module__header"><span id="commentsCnt">1</span>${label}</div>${data}`)
      } else {
        $commentsCnt.text(parseInt($commentsCnt.text()) + 1)
        $comments.find('section').last().after(data)
      }

      $comments.find('pre > code').each(function (i, block) {
        hljs.highlightBlock(block)
      })
      LazyLoadCSSImage('.avatar, .article__thumb')
      LazyLoadImage()
      $commentContent.val('')
      localStorage.removeItem('commentContent')
      $editorAdd.removeClass('disabled')
    }, (msg) => {
      alert(msg)
      $editorAdd.removeClass('disabled')
    })
  }
}

Article.init()