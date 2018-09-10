import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "Anonymous",
            text: "",
            messages: null
        };

        this.onNameChange = this.onNameChange.bind(this);
        this.onTextChange = this.onTextChange.bind(this);
        this.sendMsg = this.sendMsg.bind(this);
        this.fetchMessages = this.fetchMessages.bind(this);
    }

    onNameChange(event) {
        this.setState({name: event.target.value});
    }

    onTextChange(event){
        this.setState({text: event.target.value});
    }

    async sendMsg(){

        const url = "http://localhost:8080/api/messages";

        const payload = {author: this.state.name, text: this.state.text};

        let response;

        try {
            response = await fetch(url, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            alert("Failed to connect to server: "+ err);
            return;
        }

        if(response.status !== 201){
            alert("Error when connecting to server: status code "+ response.status);
            return;
        }

        //reset text after sending a message
        this.setState({text: ""});
    }


    componentDidMount() {
        this.fetchMessages();

    }


    async fetchMessages(){

        let since = "";
        if(this.state.messages !== null && this.state.messages.length !== 0){
            since = "?since=" + Math.max(...this.state.messages.map(m => m.id));
        }

        const url = "http://localhost:8080/api/messages" + since;

        let response;
        let payload;

        try {
            response = await fetch(url);
            payload = await response.json();
        } catch (err) {
            alert("Failed to connect to server: "+ err);
            return;
        }

        if (response.status === 200) {

            this.setState(
                prev => {
                    if(prev.messages === null){
                        return {messages: payload};
                    } else {
                        return {messages: prev.messages.concat(payload)};
                    }
                }
            );

        } else {
            alert("Error when connecting to server: status code "+ response.status);
        }
    }


    render() {

        let messages = <div></div>;

        if(this.state.messages !== null){
            messages = <div>
                {this.state.messages.map(m =>
                    <p key={"msg_key_" + m.id}> {m.author + ": " + m.text}</p>
                )}
            </div>;
        }

        return (
            <div>
                <h2>AJAX-based Chat</h2>
                <div>
                    <p className="inputName">Your name:</p>
                    <input type="text"
                           className="inputName"
                           value={this.state.name}
                           onChange={this.onNameChange}/>
                </div>
                <br/>
                <div>
                    <p>Your message:</p>
                    <textarea  cols="50"
                               rows="5"
                               value={this.state.text}
                               onChange={this.onTextChange} />
                </div>
                <br/>

                <div id="sendId" className="btn" onClick={this.sendMsg}>Send</div>
                {messages}
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById("root"));