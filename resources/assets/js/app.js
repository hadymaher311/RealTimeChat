
require('./bootstrap');

window.Vue = require('vue');
import Vue from 'vue'
import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)

import Toaster from 'v-toaster'
import 'v-toaster/dist/v-toaster.css'
Vue.use(Toaster, {timeout: 5000})

Vue.component('message', require('./components/message.vue'));

const app = new Vue({
    el: '#app',
    data: {
    	message: '',
    	chat: {
    		message:[],
    		user:[],
    		color:[],
    		time:[],
    	},
    	typing: '',
    	numberOfUsers:0,
    },
    methods:{
    	send() {
    		if (this.message.length != 0) {
				this.chat.message.push(this.message);
				this.chat.user.push('You');
				this.chat.color.push('success');
				this.chat.time.push(this.getTime());
				axios.post('/send', {
				    message: this.message,
				  })
				  .then(response => {
				    console.log(response);
					this.message = '';
				  })
				  .catch(error => {
				    console.log(error);
				  });
    		}
    	},

    	getTime() {
    		let time = new Date();
    		return time.getHours() + ':' + time.getMinutes();
    	}
    },
    watch: {
    	message() {
    		Echo.private('chat')
			    .whisper('typing', {
			        name: this.message
			    });
    	}
    },
    mounted() {
    	Echo.private('chat')
		    .listen('ChatEvent', (e) => {
		        // console.log(e);
		        this.chat.message.push(e.message);
		        this.chat.user.push(e.user);
		        this.chat.color.push('warning');
		        this.chat.time.push(this.getTime());
		    })
		    .listenForWhisper('typing', (e) => {
		    	if (e.name != '') {
		        	this.typing = "Typing...";
		    	}else {
		    		this.typing = '';
		    	}
		    });

		Echo.join(`chat`)
		    .here((users) => {
		    	this.numberOfUsers = users.length;
		        // console.log(users);
		    })
		    .joining((user) => {
		    	this.numberOfUsers++;
		    	this.$toaster.success(user.name + ' is joined chat room.');
		        // console.log(user.name);
		    })
		    .leaving((user) => {
		    	this.numberOfUsers--;
		    	this.$toaster.warning(user.name + ' is leaved chat room.');
		        // console.log(user.name);
		    });
    }
});
