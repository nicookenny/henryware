import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Navbar, Button, NavDropdown, Nav } from 'react-bootstrap'
import img from './Logo largo.svg'
import styles from './normal-navbar.module.css'
import './normal-navbar.css'
//Redux
import { connect, useDispatch } from 'react-redux';
import { search, selectCategory, selectAll,changePage } from '../../redux/actions/main'
import { fetchUserCart } from '../../redux/actions/actions'
import { loadUserData } from '../../redux/actions/auth';


const NormalNavBar = (props) => {

    //Redux
    const { searchInput, search, selectCategory, selectAll, articles, changePage, user, loadUserData } = props;
    const dispatch = useDispatch();
    
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        search(searchInput);
        changePage(1);
        history.push('/products')
    }
    // console.log(props)
    useEffect(() => {
        dispatch(fetchUserCart())
    }, [])
    return (
        <Navbar className={`${styles.navbar} d-flex flex-wrap h-auto `} >

            <Link to='/'><img className={styles.brand} src={img} /></Link>


            <div className={styles.searchBar}>
               

                
                <form onSubmit={(e) => { handleSubmit(e); }}>
                    <input value={searchInput} type='text' placeholder='Busca un producto...' onChange={(e) => {
                        search(e.target.value);
                    }} />
                    <Button className={styles.navSubmit} type='submit'>Buscar</Button>
                    
                </form>
                
            </div>
            <div className="down h-auto d-flex col-md-12">
                <div className="col-md-10 align-items-center offset-2 d-flex justify-content-end">
                    <Link to='/products' className={`${styles.navbutton} ${styles.navbarLink}`}>Catálogo</Link>
                   
                    {user.first_name ? null : <Link className={`${styles.navbutton} ${styles.navbarLink}`} to='/login'>Iniciar Sesion</Link>}
                    {user.first_name ?
                        <NavDropdown title={
                            <span className={styles.dropdownWhite}>
                                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-person-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z" />
                                    <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                    <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
                                </svg>
                                <span> {user.first_name}</span>
                            </span>

                        } className={styles.navbutton} >
                            
                                <NavDropdown.Item><Link to="/profile"> Perfil </Link></NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item> <Link onClick={()=>{
                                        //Logout
                                        localStorage.removeItem('actualToken');
                                        loadUserData({
                                            role: 'Guest'
                                        });
                                        history.push('/');
                                }}>Cerrar Sesión</Link> </NavDropdown.Item>
                                
                        </NavDropdown>
                        : <Link className={`${styles.navbutton} ${styles.navbarLink}`} to='/signup'>Registrarse</Link>}  

                    <Link className={`${styles.navbutton} ${styles.navbuttonCart} ${styles.navbarLink}`} to="/cart">
                        {articles!==0 && <span className={`${styles.numeroCarrito}`}>{articles}</span>}
                        <svg width="2em" height="2em" viewBox="0 0 16 16" className="bi bi-cart4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l.5 2H5V5H3.14zM6 5v2h2V5H6zm3 0v2h2V5H9zm3 0v2h1.36l.5-2H12zm1.11 3H12v2h.61l.5-2zM11 8H9v2h2V8zM8 8H6v2h2V8zM5 8H3.89l.5 2H5V8zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </Navbar>
    );
}

const mapStateToProps = state => {
    const articles = state.cart.products.products ?  state.cart.products.products.length : null;
    return {
        searchInput: state.main.searchInput,
        articles,
        user: state.auth
    }
};

const mapDispatchToProps = dispatch => {
    return {
        search: input => dispatch(search(input)),
        selectCategory: category => dispatch(selectCategory(category)),
        selectAll: () => dispatch(selectAll()),
        fetchUserCart: () => dispatch(fetchUserCart()),
        changePage: num => dispatch(changePage(num)),
        loadUserData: userData => dispatch(loadUserData(userData))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NormalNavBar);