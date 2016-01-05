import {store, Actions, State} from '../store';
import {has, translate as $t, NONE_CATEGORY_ID} from '../helpers';

import Modal from './Modal';
import CategorySelectComponent from './CategorySelectComponent';
import OperationTypeSelectComponent from './OperationTypeSelectComponent';
import ValidableInputText from './ValidableInputText';
import ValidableInputNumber from './ValidableInputNumber';
import ValidableInputDate from './ValidableInputDate';

export default class AddOperationModal extends React.Component {
    constructor(props) {
        has(props,'account');
        super(props);
        this.state = {
            operation : {
                categoryId: NONE_CATEGORY_ID,
                type: store.getUnknownOperationType().id,
                bankAccount: this.props.account.accountNumber
            },
            titleIsOK : false,
            amountIsOK : false,
            dateIsOK : false,
        }
    }

    onSubmit(event) {
        // Some information is missing to have a "full" operation.
        let operation = this.state.operation;
        operation.bankAccount = this.props.account.accountNumber;
        operation.operationTypeID = operation.type;
        delete operation.type;

        Actions.CreateOperation(this.props.account.id, operation);

        event.preventDefault();
        $(`#addOperation${this.props.account.id}`).modal('toggle');

        this.clearOperation();
    }

    clearOperation() {
        this.setState({operation : {
            categoryId: NONE_CATEGORY_ID,
            type: store.getUnknownOperationType().id
        }});
        this.refs.date.clear();
        this.refs.title.clear();
        this.refs.amount.clear();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Only rerender if the button status has to be updated
        return this.isSubmitDisabled() ===
               !(nextState.titleIsOK && nextState.amountIsOK && nextState.dateIsOK);
    }

    isSubmitDisabled() {
        return !(this.state.titleIsOK && this.state.amountIsOK && this.state.dateIsOK);
    }

    returnDateValue(date) {
        if (date) {
            let operation = this.state.operation;
            operation.date = new Date(date);
            this.setState({operation, dateIsOK: true});
        } else {
            this.setState({dateIsOK: false});
        }
    }

    returnTitleValue(title) {
        if (title && title.trim().length > 0) {
            let operation = this.state.operation;
            operation.title = title;
            this.setState({operation, titleIsOK: true});
        } else {
            this.setState({titleIsOK: false});
        }
    }

    returnAmountValue(amount) {
        if (typeof amount === 'number') {
            let operation = this.state.operation;
            operation.amount = amount;
            this.setState({operation, amountIsOK: true});
        } else {
            this.setState({amountIsOK: false});
        }
    }

    onSelectOperationType(id) {
        let operation = this.state.operation;
        operation.type = id;
        this.setState({operation});
    }

    onSelectCategory(id) {
        let operation = this.state.operation;
        operation.categoryId = id;
        this.setState({operation});
    }

    render() {
        let modalId = 'addOperation' + this.props.account.id;

        let labelDate = $t('client.addoperationmodal.date');
        let labelTitle = $t('client.addoperationmodal.label');
        let labelAmount = $t('client.addoperationmodal.amount');

        let modalBody = <div>
                            <span>{$t('client.addoperationmodal.description', {account: this.props.account.accountNumber})}</span>
                            <form id={'formAddOperation'+this.props.account.id} onSubmit={this.onSubmit.bind(this)}>
                                <ValidableInputDate
                                  returnInputValue={this.returnDateValue.bind(this)}
                                  inputID={"date"+this.props.account.id}
                                  label={labelDate}
                                  ref='date'
                                />
                                <div className="form-group">
                                    <label className="control-label" htmlFor={"type"+this.props.account.id}>
                                    {$t('client.addoperationmodal.type')}
                                    </label>
                                    <OperationTypeSelectComponent
                                      operation={this.state.operation}
                                      onSelectId={this.onSelectOperationType.bind(this)}
                                    />
                                </div>
                                <ValidableInputText
                                  inputID={"title"+this.props.account.id}
                                  returnInputValue={this.returnTitleValue.bind(this)}
                                  label={labelTitle}
                                  ref='title'
                                />
                                <ValidableInputNumber
                                  inputID={"amount"+this.props.account.id}
                                  returnInputValue={this.returnAmountValue.bind(this)}
                                  step='0.01'
                                  label={labelAmount}
                                  ref='amount'
                                />
                                <div className="form-group">
                                    <label className="control-label" htmlFor={"category"+this.props.account.id}>
                                        {$t('client.addoperationmodal.category')}
                                    </label>
                                    <CategorySelectComponent
                                      operation={this.state.operation}
                                      onSelectId={this.onSelectCategory.bind(this)}
                                    />
                                </div>
                           </form>
                       </div>;

        let modalTitle = $t('client.addoperationmodal.add_operation', {account: this.props.account.accountNumber});
        let modalFooter = <div>
                              <input type='button' className="btn btn-default" data-dismiss="modal"
                                className="btn" value={$t('client.addoperationmodal.cancel')}
                              />
                              <input type='submit' form={'formAddOperation'+this.props.account.id}
                                className="btn btn-warning" value={$t('client.addoperationmodal.submit')}
                                disabled={this.isSubmitDisabled()}
                              />
                          </div>;
        return <Modal
            modalId = {modalId}
            modalBody = {modalBody}
            modalTitle = {modalTitle}
            modalFooter = {modalFooter}
        />
    }
}
