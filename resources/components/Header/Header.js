import Component from '@Components/Base.js'
import aph from 'aph'

export default class Header extends Component {

}

Header.init = () => aph('.js-header').each(element => new Header(element))
