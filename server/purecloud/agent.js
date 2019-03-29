const fetch = require("node-fetch");

const generarToken = async() => {

    console.log('Purecloud - Agent - generarToken');
    const config = {
        headers: {
            'Authorization': `Basic ${process.env.PURECLOUD_CREDENTIALS_BASE64}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        method: 'POST'
    }

    const response = await fetch(`https://login.${process.env.PURECLOUD_ENVIRONMENT}/token`, config);
    return await response.json();
}

const getUser = async(email, requestHeaders) => {

    console.log('Purecloud - Agent - getUser');

    const response = await fetch(`https://api.${process.env.PURECLOUD_ENVIRONMENT}/api/v2/users?pageSize=1000`,{
        method: 'GET',
        headers : requestHeaders
    });

    let users = await response.json();

    if (users && users.entities.length){
        const user = users.entities.filter(u => u.username === email)[0];
        return user;
    }else{
        throw new Exception('Error al obtener el usuario');
    }

}

const getStatusUser = async () => {

    console.log('Purecloud - Agent - getStatusUser');
    const token = await generarToken();
    const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `${token['token_type']} ${token['access_token']}`
    }

    const user = await getUser(process.env.PURECLOUD_AGENT, requestHeaders);

    const response = await fetch(`https://api.${process.env.PURECLOUD_ENVIRONMENT}/api/v2/users/${user.id}/routingstatus`, { 
        method: 'GET',
        headers: requestHeaders
    });

    let usersStatus = await response.json();

    console.log(usersStatus);

    if(usersStatus.status === 'IDLE' || usersStatus.status === 'INTERACTING'){
        return true;
    }else{
        return false;
    }
}

module.exports = {
    getStatusUser
}