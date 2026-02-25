<template>
  <div class="screen">
    <div class="phone">

      <div class="top">
        <h1>{{ title }}</h1>
        <p>{{ $t('manageBusiness') }}</p>
      </div>

      <div class="card">
        <slot />

        <div class="back" @click="$router.push('/home')">
          ← {{ $t('back') }}
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps(["title"])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* { font-family: 'Poppins', sans-serif; font-size: 12px; }

.screen {
  height: 100vh;
  background: linear-gradient(135deg, #8FC3B5 60%, #7BB7A9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone {
  width: 100%;
  height: 100%;
  background: #0F6F73;
  border-radius: 0px;
  overflow: hidden;
  position: relative;
}

.top {
  padding: 60px 30px 20px;
  color: white;
      margin-top: -47px;
}

.top h1 {
  margin-top: 58px;
  font-size: 23px;
      font-weight: 600;
}

.card {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80%;
  background: #F4F6F6;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 30px;
  overflow-y: auto;
}

.input {
  background: #E8ECEC;
  border-radius: 25px;
  padding: 12px 15px;
  margin-bottom: 15px;
}

.input input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: #0F6F73;
  color: white;
  margin-top: 10px;
}

.back {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #0F6F73;
  cursor: pointer;
}
</style>