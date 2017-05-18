import aph from 'aph'
import Component from 'Components/Base'

export default class Footer extends Component {

}

Footer.seek = () => aph('.js-footer').each(element => new Footer(element))
