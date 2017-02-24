customElements.define('tindev-details', class extends HTMLElement {
  constructor() {
    super();
    this._carousel = this.querySelector('tindev-carousel');
  }

  connectedCallback() {
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this._updateBindings();
  }

  _updateBindings() {
    if(!this.data) return;
    this._carousel.selected = 0;
    while(this._carousel.firstChild) this._carousel.removeChild(this._carousel.firstChild);
    const div = document.createElement('div');
    div.classList.add('carousel__item');
    div.style.backgroundImage = `url('${this.data.image}')`;
    this._carousel.appendChild(div);
    this.querySelector('.item__details__name').textContent = this.data.name;
    this.querySelector('.item__details__name').href = this.data.url;
    this.querySelector('.description').textContent = this.data.description;
  }
});
