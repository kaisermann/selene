import Component from '@Components/Base'
import aph from 'aph'

export default class Footer extends Component {

}

Footer.seek = () => aph('.js-footer').each(element => new Footer(element))
