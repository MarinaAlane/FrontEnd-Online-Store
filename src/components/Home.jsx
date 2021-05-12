import React from 'react';
import { Link } from 'react-router-dom';
import ListOfCategories from './ListOfCategories';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import * as api from '../services/api';
import '../CSS/Home.css';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      productsList: [],
      categories: [],
      addItem: [],
    };
    this.handleSearchTextChange = this.handleSearchTextChange.bind(this);
    this.fetchApiSearch = this.fetchApiSearch.bind(this);
    this.fetchByCategoryId = this.fetchByCategoryId.bind(this);
    this.addItemCart = this.addItemCart.bind(this);
    this.setCart = this.setCart.bind(this);
    // Sintaxe localStorage
    // localStorage.setItem('shoppingCart', JSON.stringify(addItem));
    // JSON.parse(localStorage.getItem('shoppingCart'));
  }

  componentDidMount() {
    api.getCategories()
      .then((response) => this.setState({ categories: response }));
    this.setCart();
  }

  handleSearchTextChange({ target }) {
    const { value } = target;
    this.setState({
      searchText: value,
    });
  }

  setCart() {
    if (localStorage.getItem('shoppingCart')) {
      const shoppingCart = JSON.parse(localStorage.getItem('shoppingCart'));
      this.setState({
        addItem: shoppingCart,
      });
    }
  }

  addItemCart(id) {
    const { productsList } = this.state;
    const itemProduct = productsList.find((item) => id === item.id);
    itemProduct.quantity = 1;
    this.setState((prevState) => {
      localStorage
        .setItem('shoppingCart', JSON.stringify([...prevState.addItem, itemProduct]));
      return ({
        addItem: [...prevState.addItem, itemProduct],
      });
    });
  }

  async fetchByCategoryId(categoryId) {
    const fetchList = await api.getProductsFromCategoryAndQuery(categoryId, '');
    this.setState({
      productsList: fetchList.results,
    });
  }

  async fetchApiSearch() {
    const { searchText } = this.state;
    const fetchList = await api.getProductsFromCategoryAndQuery('', searchText);

    if (!fetchList.results.length) {
      this.setState({
        showMessage: true,
      });
    } else {
      this.setState({
        productsList: fetchList.results,
        showMessage: false,
      });
    }
  }

  render() {
    const { productsList, showMessage, categories, addItem } = this.state;
    const emptySearchMessage = <p>Nenhum produto foi encontrado</p>;
    return (
      <div>
        <header className="header">
          <h1 className="title-store"> G1 Online Store</h1>
          <div className="btn-bar">
            <SearchBar
              onSearchTextChange={ this.handleSearchTextChange }
              onClickSearch={ this.fetchApiSearch }
            />
            <div
              className="btn-cart"
              onClick={
                <Link
                  to={ {
                    pathname: '/shopping-cart',
                    state: addItem,
                  } }
                  data-testid="shopping-cart-button"
                >
                  Carrinho
                </Link>
              }
            >
              <div className="quantity">
                <span>{ addItem.length }</span>
              </div>
            </div>
          </div>
        </header>
        <div className="main-content-container">
          <ListOfCategories
            categories={ categories }
            onClickSelectedCategory={ this.fetchByCategoryId }
          />
          {
            showMessage ? emptySearchMessage : <ProductCard
              products={ productsList }
              onClick={ this.addItemCart }
              cartItens={ addItem }
            />
          }
        </div>
      </div>
    );
  }
}

export default Home;
