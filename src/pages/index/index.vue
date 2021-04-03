<template>
	<view class="content bg-blue-300 mt-1">
		<image class="logo" src="/static/logo.png"></image>
		<view>
			<text class="title">{{title}}</text>
		</view>
    <u-button>测试按钮热更新</u-button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello',
    }
  },
  onLoad() {

  },
  methods: {

  },
}
</script>

<style lang="scss">
	.content {
    @apply flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
    .logo{
      width: 200px;
    }
	}

	.logo {
    @apply h-20 w-20;
		margin: 200rpx auto 50rpx auto;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
