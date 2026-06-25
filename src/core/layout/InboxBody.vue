<template>
  <div class="grow flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out" :class="inboxSidebarOpen ? 'translate-x-1/3' : 'translate-x-0'">



  </div>
</template>

<script>
import { ref } from 'vue'


const mailUser01 = '/images/user-40-11.jpg'
const mailUser02 = '/images/user-avatar-80.png'
const mailImage = '/images/inbox-image.jpg'

export default {
  name: 'InboxBody',
  props: ['inboxSidebarOpen'],
  setup() {

    const mails = ref([
      {
        id: '0',
        open: false,
        image: mailUser01,
        name: 'Dominik Lamakani',
        email: 'dominiklama@acme.com',
        date: 'Sep 3, 3:18 PM',
        recipients: ['me', 'Carolyn'],
        excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore…',
        message: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p><p>Consectetur adipiscing elit, sed do eiusmod aliqua? Check below:</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p><p>Cheers,</p><p class="font-medium">Dominik Lamakani</p>',
      },
      {
        id: '1',
        open: false,
        image: mailUser02,
        name: 'Acme Inc.',
        email: 'acmeinc@acme.com',
        date: 'Sep 3, 3:18 PM',
        recipients: ['me', 'Dominik'],
        excerpt: 'Dominik, lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt…',
        message: '<p>Dominik, lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p><p>Consectetur adipiscing elit, sed do eiusmod aliqua? Check below:</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p><p>Cheers,</p><p class="font-medium">Acme Inc.</p>',
      },
      {
        id: '2',
        open: true,
        image: mailUser01,
        name: 'Dominik Lamakani',
        email: 'dominiklama@acme.com',
        date: 'Sep 4, 3:37 AM',
        recipients: ['me', 'Carolyn'],
        excerpt: 'Hey Acme 👋 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt…',
        message: `<p>Hey Acme 👋</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis <span class="underline">nostrud exercitation ullamco</span> laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p><p>Consectetur adipiscing elit, sed do eiusmod <a class="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400" href="#0">tempor magna</a> aliqua? Check below:</p><p><img src=${mailImage} width="320" height="190" alt="Inbox image" /></p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p><p>Cheers,</p><p class="font-medium">Dominik Lamakani</p>`,
      },      
    ])

    return {
      mails,
    }      
  }
}
</script>