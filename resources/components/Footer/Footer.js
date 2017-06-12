import Component from '@Components/Base.js'
import aph from 'aph'

export default class Footer extends Component {

}

Footer.init = () => aph('.js-footer').each(element => new Footer(element))
