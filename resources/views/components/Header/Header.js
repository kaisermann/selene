import aph from 'aph'
import Component from 'Components.Base'

export default class Header extends Component {

}

Header.seek = () => aph('.js-header').each(element => new Header(element))
