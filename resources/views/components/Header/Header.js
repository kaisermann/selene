import Component from 'Components/Base'
import aph from 'aph'

export default class Header extends Component {

}

Header.seek = () => aph('.js-header').each(element => new Header(element))
