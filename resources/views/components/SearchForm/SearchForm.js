import Component from 'Components/Base'
import aph from 'aph'

export default class SearchForm extends Component {

}

SearchForm.seek = () => aph('.js-search-form').each(element => new SearchForm(element))
