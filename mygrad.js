const supportedCards = {
    visa:"", mastercard:""
};
const countries = [
    {
        code: "US",
        currency: "USD",
        country: 'United States'
    },
    {
        code: "NG",
        currency: "NGN",
        country: 'Nigeria'
    },
    {
        code: 'KE',
        currency: 'KES',
        country: 'Kenya'
    },
    {
        code: 'UG',
        currency: 'UGX',
        country: 'Uganda'
    },
    {
        code: 'RW',
        currency: 'RWF',
        country: 'Rwanda'
    },
    {
        code: 'TZ',
        currency: 'TZS',
        country: 'Tanzania'
    },
    {
        code: 'ZA',
        currency: 'ZAR',
        country: 'South Africa'
    },
    {
        code: 'CM',
        currency: 'XAF',
        country: 'Cameroon'
    },
    {
        code: 'GH',
        currency: 'GHS',
        country: 'Ghana'
    }
];

const appState = {};

const formatAsMoney = (amount, buyerCountry)=>{
    const countryMatched = countries.find(c=>c.country == buyerCountry);
    return countryMatched ?  amount.toLocaleString(undefined, {style:'currency', currency: countryMatched.currency}):
        amount.toLocaleString('US', {style:'currency', currency: 'USD'});
};

const flagIfInvalid = (field, isValid)=>{
    isValid == true ?
        field.classList.remove('is-invalid'):
        field.classList.add('is-invalid');
};

const expiryDateFormatIsValid = (target)=>{
    const pattern = /^([0-9]{2})\/([0-9]{2})$/;
    /* check for matched pattern */
    if (pattern.test(target)){
        const targets = target.split('/');
        if (targets[0] < 13){
            /* check if date is a future */
            const today = new Date();
            const targetDate = new Date('20'+targets[1], (targets[0]-1));
            return targetDate.setHours(0,0,0,0) > today.setHours(0,0,0,0);
        }
    } else {
        return false;
    }
};

const detectCardType = ({target})=>{
    const creditCardDiv = document.querySelector('[data-credit-card]');
    const cardImageLogo = document.querySelector('[data-card-type]');
    //console.log('detectCardType target', target.type);
    //console.log('detectCardType target', typeof  target);
    if (target.value.startsWith("4")){
        creditCardDiv.classList.remove('is-mastercard');
        creditCardDiv.classList.add('is-visa');
        cardImageLogo.src = supportedCards.visa;
        return 'is-visa';
    } else {
        creditCardDiv.classList.remove('is-visa');
        creditCardDiv.classList.add('is-mastercard');
        cardImageLogo.src = supportedCards.mastercard;
        return 'is-mastercard';
    }
};

const validateCardExpiryDate = ({target})=>{
    const isValid = expiryDateFormatIsValid(target.value);
    /* flag the date input field*/
    flagIfInvalid(document.querySelector('[data-cc-info] input:nth-child(2)'), isValid);
    return isValid;
};

const validateCardHolderName = ({target})=>{
    /* check given fullname */
    const fullname = target.value.split(' ');
    let isValid = fullname.length < 3;
    console.log(isValid);
    if (isValid){
        fullname.forEach(name=>{
            if (!name.match(/([^0-9]{3,})$/)) isValid = false;
        });
    }
    /* flag the name input field */
    flagIfInvalid(document.querySelector('[data-cc-info] input:nth-child(1)'), isValid);
    return isValid;
};

const validateWithLuhn = digits =>{
    const reverseDigits = digits.reverse();
    /* check the given card number */
    const mappedDigits = reverseDigits.map( (val, index)=>{
        if (index > 0){
            /* only check for odd index */
            if(index % 2 != 0){
                val *= 2; /* double the current integer */
                /* if val > 9, replace with sum or subtract by 9 */
                return (val > 9) ? ( (val+val) > 9 ? (val-9):(val+val)): val;
            }
        } return val;
    });
    /* check credit card validity */
    const sumOfDigits = mappedDigits.reduce( (sum, val)=>sum+val,0);

    return sumOfDigits % 10 ? false : true;
};

const validateCardNumber = ()=>{
    const digitsDiv = document.querySelectorAll('[data-cc-digits] input');
    console.log('input list ', digitsDiv);
    console.log(digitsDiv[0].value);
    /* check entered numbers are valid numbers*/
    let IsUserInputValid = true;
    digitsDiv.forEach(input=>{
        if (!parseInt(input.value)) IsUserInputValid = false;
    });
    /* Check and validate Card Number */
    let isCardValid = null;
    if (IsUserInputValid){
        let cardNumber='';
        digitsDiv.forEach(input=>{
            cardNumber += input.value;
        });
        console.log('User Inputs Card no.', cardNumber);

        const cardNumberList = cardNumber.split('');
        const cardNumberInt =  cardNumberList.map(val=>{
           return parseInt(val);
        });

        console.log('Card no as array : ', cardNumberInt);

        isCardValid = validateWithLuhn(cardNumberInt);
    }

    if (isCardValid){
        document.querySelector('[data-cc-digits]').classList.remove('is-invalid');
    } else {
        document.querySelector('[data-cc-digits]').classList.add('is-invalid');
    }
};

const uiCanInteract = ()=>{
    document.querySelector('[data-cc-digits] input:nth-child(1)').addEventListener("blur", detectCardType);
    document.querySelector('[data-cc-info] input:nth-child(1)').addEventListener("blur", validateCardHolderName);
    document.querySelector('[data-cc-info] input:nth-child(2)').addEventListener("blur", validateCardExpiryDate);
    document.querySelector('[data-pay-btn]').addEventListener("click", validateCardNumber);
    document.querySelector('[data-cc-digits] input:nth-child(1)').focus();
};

const displayCartTotal = ({results})=>{
    const [data] = results;
    const {itemsInCart, buyerCountry} = data;
    appState.items = itemsInCart;
    appState.country = buyerCountry;
    appState.bill = itemsInCart.reduce( (sum, item)=> sum + (item.price * item.qty), 0);
    appState.billFormated = formatAsMoney(appState.bill, appState.country);
    document.querySelector('[data-bill]').textContent = appState.billFormated;
    uiCanInteract();
};

const fetchBill = ()=>{
    const api = "https://randomapi.com/api/006b08a801d82d0c9824dcfdfdfa3b3c";
    fetch(api)
        .then(response=>{
            return response.json();})
        .then((data)=>{
            const {error} = data;
            if (error){
                console.log(error);
            } else {
                displayCartTotal(data);
            }
        });
};

const startApp = () => {
    fetchBill();
};

startApp();