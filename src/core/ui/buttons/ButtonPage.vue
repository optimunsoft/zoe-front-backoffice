<template>
  <div class="space-y-8">

    <!-- Appearances -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Appearances</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button variant="primary">Primary</Button>
        </div>
        <div class="m-1.5">
          <Button variant="secondary">Secondary</Button>
        </div>
        <div class="m-1.5">
          <Button variant="tertiary">Tertiary</Button>
        </div>
        <div class="m-1.5">
          <Button variant="danger">Danger</Button>
        </div>
        <div class="m-1.5">
          <Button variant="danger-outline">Danger</Button>
        </div>
        <div class="m-1.5">
          <Button variant="success">Success</Button>
        </div>
        <div class="m-1.5">
          <Button variant="success-outline">Success</Button>
        </div>
      </div>
    </section>

    <!-- Color + appearance -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Color + Appearance</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button color="danger" appearance="solid">Danger solid</Button>
        </div>
        <div class="m-1.5">
          <Button color="danger" appearance="outline">Danger outline</Button>
        </div>
        <div class="m-1.5">
          <Button color="violet" appearance="outline">Violet outline</Button>
        </div>
        <div class="m-1.5">
          <Button color="neutral" appearance="outline">Neutral outline</Button>
        </div>
      </div>
    </section>

    <!-- States -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">States</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button variant="primary" block disabled>Disabled</Button>
        </div>
        <div class="m-1.5">
          <Button variant="primary" block loading>Loading</Button>
        </div>
      </div>
    </section>

    <!-- Sizes -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Sizes</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button variant="primary" size="xs">Button</Button>
        </div>
        <div class="m-1.5">
          <Button variant="primary" size="sm">Button</Button>
        </div>
        <div class="m-1.5">
          <Button variant="primary" size="md">Button</Button>
        </div>
        <div class="m-1.5">
          <Button variant="primary" size="lg">Button</Button>
        </div>
      </div>
    </section>

    <!-- Buttons with an Icon -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Buttons with an Icon</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button variant="primary">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </template>
            Add Event
          </Button>
        </div>
        <div class="m-1.5">
          <Button variant="secondary">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </template>
            Edit Content
          </Button>
        </div>
        <div class="m-1.5">
          <Button variant="danger-outline">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </template>
            Delete
          </Button>
        </div>
      </div>
    </section>

    <!-- Icon Buttons -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Icon Buttons</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <Button variant="secondary" icon-only aria-label="Editar">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M11.7.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM4.6 14H2v-2.6l6-6L10.6 8l-6 6zM12 6.6L9.4 4 11 2.4 13.6 5 12 6.6z" />
              </svg>
            </template>
          </Button>
        </div>
        <div class="m-1.5">
          <Button variant="danger-outline" icon-only aria-label="Eliminar">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
              </svg>
            </template>
          </Button>
        </div>
        <div class="m-1.5">
          <Button variant="tertiary" icon-only aria-label="Confirmar">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M14.3 2.3L5 11.6 1.7 8.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l4 4c.2.2.4.3.7.3.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0z" />
              </svg>
            </template>
          </Button>
        </div>
      </div>
    </section>

    <!-- Button Groups -->
    <section>
      <h2 class="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-6">Button Groups</h2>
      <div class="flex flex-wrap items-center -m-1.5">
        <div class="m-1.5">
          <ButtonGroup>
            <Button
              v-for="period in periods"
              :key="period"
              variant="secondary"
              :active="groupValue === period"
              @click="groupValue = period"
            >
              {{ period }}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'

const groupValue = ref('Weekly')
const periods = ['Weekly', 'Monthly', 'Yearly']
</script>
