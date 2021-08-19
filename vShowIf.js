class vShowIf {
  //1. 代理数据与数据劫持
  //2. 初始化DOM
  /*
    showPool [
      dom,
      {
        type:if/show,
        show:true/false,
        data:绑定的数据
      }
    ]
    eventPool[
      [
        dom,
        handler
      ]
    ]

  */
  // 3.初始化视图
  //4. 根据eventPool 事件处理函数的绑定
  //5.改变数据的同时,改变dom
  constructor(options) {
    const { el, data, methods } = options;
    this.el = document.querySelector(el);
    this.data = data;
    this.methods = methods;
    this.showPool = new Map();
    this.eventPool = new Map();

    this.init();
  }

  init () {
    this.initData();
    this.initDom(this.el);
    this.initView(this.showPool);
    this.initEvent(this.eventPool);

  }

  initData () {
    for (let key in this.data) {
      Object.defineProperty(this, key, {
        get () {
          return this.data[key]
        },
        set (newValue) {
          this.data[key] = newValue
          this.domChange(key, this.showPool)
        }
      })
    }
  }

  initDom (el) {
    const _childNodes = el.childNodes;
    if (!_childNodes.length) {
      return;
    }

    _childNodes.forEach(dom => {
      if (dom.nodeType === 1) {
        const vIf = dom.getAttribute('v-if');
        const vShow = dom.getAttribute('v-show');
        const vEvent = dom.getAttribute('@click');

        if (vIf) {
          this.showPool.set(dom, {
            type: 'if',
            show: this.data[vIf],
            data: vIf
          })
        } else if (vShow) {
          this.showPool.set(dom, {
            type: 'show',
            show: this.data[vShow],
            data: vShow
          })
        }
        if (vEvent) {
          this.eventPool.set(dom, this.methods[vEvent]);
        }
      }
      this.initDom(dom);
    })

  }

  initView (showPool) {
    this.domChange(null, showPool)
  }

  domChange (data, showPool) {
    if (!data) {
      for (let [k, v] of showPool) {
        switch (v.type) {
          case 'if':
            v.comment = document.createComment('v-if');
            !v.show && k.parentNode.replaceChild(v.comment, k);
            console.log(k, 'if');
            break;
          case 'show':
            !v.show && (k.style.display = 'none')
            break;
          default:
            break;
        }
      }
      return;
    }

    for (let [k, v] of showPool) {
      if (v.data === data) {
        switch (v.type) {
          case 'if':
            v.show ? k.parentNode.replaceChild(v.comment, k)
              : v.comment.parentNode.replaceChild(k, v.comment)
            v.show = !v.show
            break;
          case 'show':
            v.show ? k.style.display = 'none' : k.style.display = 'block';
            v.show = !v.show
            break;
          default:
            break;
        }
      }
    }

  }

  initEvent (eventPool) {
    for (let [k, v] of eventPool) {
      k.addEventListener('click', v.bind(this), false)
    }
  }
}