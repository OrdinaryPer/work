<template>
  <el-container class="home-container">
    <!-- 导航栏 -->
    <el-header>
      <div>
        <img src="../assets/shop-logo.jpg" alt="" />
        <span>某某后台管理系统</span>
      </div>
      <el-button @click="logout" type="info">退出</el-button>
    </el-header>
    <!-- 下方内容区 -->
    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activatePath"
        >
          <el-submenu :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id">
            <template slot="title">
              <i :class="iconItems[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item @click="saveNavigationPath('/' + subItem.path)"
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 正文区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconItems: {},
      isCollapse: false,
      activatePath: ''
    }
  },

  created() {
    this.getMenuList()
    this.activatePath = window.sessionStorage.getItem('activatePath')
  },

  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // 获取所有侧边栏菜单信息
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
      // console.log(res)
      // 根据一级菜单的每一项 id 绑定一个图标
      const icons = ['el-icon-star-on', 'el-icon-info', 'el-icon-zoom-out',
        'el-icon-help', 'el-icon-picture-outline']
      let i = 0
      for (const item of this.menuList) {
        this.iconItems[item.id] = icons[i++]
        // console.log(item.id)
      }
    },

    // 侧边栏宽度切换
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    saveNavigationPath(activatePath) {
      window.sessionStorage.setItem('activatePath', activatePath)
      this.activatePath = activatePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d4e;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      padding-left: 15px;
    }
  }

  img {
    width: 70px;
    height: 100%;
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedfe;
}

.home-container {
  height: 100%;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
