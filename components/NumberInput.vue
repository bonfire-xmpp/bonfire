<template>
  <div class="input d-flex rounded">
    <button class="l rounded-l d-flex justify-center align-center" @click="dvalue--" ><span class="flex-grow-1">&ndash;</span></button>
    <input ref="input" class="px-2" :min="min" :max="max" type="number" v-model.number="dvalue">
    <button class="r rounded-r d-flex justify-center align-center" @click="dvalue++"><span class="flex-grow-1">+</span></button>
  </div>
</template>

<script>
export default {
  name: "NumberInput",
  props: {
    min: Number,
    max: Number,
    value: Number,
  },
  data() {
    return {
      dvalue: this.value || 0,
    }
  },
  watch: {
    dvalue(v) {
      // Clamp value
      if(Math.abs(v) > 127) this.dvalue = Math.min(Math.max(v, this.min), this.max);
      this.$emit('input', v)
    }
  },
}
</script>

<style scoped lang="scss">
$number-input-border-color: map-get($greys, "200");
$number-input-background-color: map-get($black, "base");
$number-input-button-background-color: map-get($black, "lighten");
$number-input-outer-border-width: 1px;
$number-input-outer-inner-width: 1px;

input[type="number"] {
  appearance: textfield;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
}

.input {
  background-color: $number-input-background-color;
  height: 26px; box-sizing: content-box;
}

button {
  width: 3ex;
  background-color: $number-input-button-background-color;
  border: $number-input-outer-border-width solid $number-input-border-color;
  font-weight: 900;
  font-size: 1.1em;

  transition-property: border-bottom-color, border-top-color, border-left-color, border-right-color, background-color;
  transition-duration: 150ms;
  transition-timing-function: ease;

  &:hover {
    background-color: lighten($number-input-button-background-color, 10);
  }

  &:active, &:focus {
    background-color: lighten($number-input-button-background-color, 20);
    border: $number-input-outer-border-width solid lighten($number-input-border-color, 10);
    &.l { border-right: $number-input-outer-inner-width solid lighten($number-input-border-color, 10); }
    &.r { border-left:  $number-input-outer-inner-width solid lighten($number-input-border-color, 10); }
  }
}

input {
  // Has to be a bit wider to fit -123
  width: 3.5ex;
  color: map-get($white, "base");
  font-weight: 600;

  border-top: $number-input-outer-border-width solid $number-input-border-color;
  border-bottom: $number-input-outer-border-width solid $number-input-border-color;
}


.l { border-right: $number-input-border-color solid 1px; }
.r { border-left:  $number-input-border-color solid 1px; }

</style>
