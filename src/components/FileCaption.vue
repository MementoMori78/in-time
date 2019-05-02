<template>
    <div class="card white">
              <div class="card-content balck-text">
                  <span class="card-title">{{name}}</span>
                  <p>Шлях до файлу: </p>
                  <p>{{filename}}</p>
              </div>
          </div>
</template>

<script>
export default {
    name: 'FileCaption',
    props: {
        name: String,
        filename: String,
        countCaption: String,
        count: Number 
    }
}
</script>
