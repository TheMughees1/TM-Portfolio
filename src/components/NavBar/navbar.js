import React from 'react'
import'./navbar.css'
import logo from'./../../assests/logo.png.png'
import contactImg from '../NavBar/contact.png.png'
import {Link} from 'react-scroll';
const Navbar = () => {
  return (
    <nav className="navbar">
        <img src={logo} alt="logo" className='logo' />
        <div className="desktoMenu">
        <ul>
                    <li><a class="active" href="#Home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#portfolio">Portfolio</a></li>
                    <li><a href="#Contact">Contact</a></li>
                </ul>
        </div>
        <button className="desktopMenuBtn">
            <img src="contact.png.png" alt="" className="desktopMenuImg" />
        Contact Me
        </button>
    </nav>
  )
}

export default Navbar
