class MVVM {
  constructor(el, data) {
    this.el = document.querySelector(el);
    console.log(this.el, 'dddddd111');
    this.domPool = []
    this._data = data;
    this.init()
  }

  init () {
    this.initData()
    this.initDom()
  }

  initDom () {
    this.bindDom(this.el)
    this.bindInput(this.el)
  }

  initData () {
    const _this = this;
    // Object.defineProperty 版本
    // this.data = {};
    // for (let key in this._data) {
    //   Object.defineProperty(this.data, key, {
    //     get () {
    //       console.log('获取数据:', key, _this._data[key]);
    //       return _this._data[key];
    //     },
    //     set (newValue) {
    //       console.log('设置数据：', key, newValue);
    //       _this.domPool[key].innerHTML = newValue;
    //       _this._data[key] = newValue;

    //     }
    //   })
    // }

    // Proxy 版本
    this.data = new Proxy(this._data, {
      get (target, key) {
        return Reflect.get(target, key)
      },
      set (target, key, value) {
        _this.domPool[key].innerHTML = value;
        return Reflect.set(target, key, value)
      }
    })
    // console.log(this.data['age']);

  }

  bindDom (el) {
    const childNodes = el.childNodes;
    childNodes.forEach(v => {
      if (v.nodeType === 3) {
        const _value = v.nodeValue;
        if (_value.trim().length) {
          let _isVaild = /\{\{(.+?)\}\}/.test(_value);
          if (_isVaild) {
            const _key = _value.match(/\{\{(.+?)\}\}/)[1].trim();
            this.domPool[_key] = v.parentNode;
            v.parentNode.innerText = this.data[_key] || '';
          }
        }
      }
      v.childNodes && this.bindDom(v);
    })
  }

  bindInput (el) {
    const _allInputs = el.querySelectorAll('input');
    _allInputs.forEach(input => {
      const _vModel = input.getAttribute('v-model');
      if (_vModel) {
        input.addEventListener('keyup', this.handleInput.bind(this, _vModel, input), false);
      }
    })
  }
  handleInput (key, input) {
    const _value = input.value;
    this.data[key] = _value;
    console.log(this.data, 'ddddddd');
  }

  setData (key, value) {
    this.data[key] = value;
  }
}


// 1.数据 => 响应式数据  Oject.defineProerty Proxy
// 2.input  =>input/keyup  -> 事件处理函数的绑定  -> 改变数据
// 3.相关的DOM => 数据  => 绑定在一起   操作数据中的某个属性  -> 对应DOM的改变 
// { name:span 节点}